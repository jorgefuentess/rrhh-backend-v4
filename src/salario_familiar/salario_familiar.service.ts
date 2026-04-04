import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Novedad } from '../novedades_del_mes/novedad.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { User } from '../users/user.entity';
import {
  BajaSalarioFamiliarDependienteDto,
  CreateSalarioFamiliarDto,
  CreateSalarioFamiliarPagoDto,
  SalarioFamiliarConyugeDto,
  SalarioFamiliarHijoDto,
} from './dto/create-salario-familiar.dto';
import {
  UpdateSalarioFamiliarConyugeDto,
  UpdateSalarioFamiliarDto,
  UpdateSalarioFamiliarHijoDto,
  UpdateSalarioFamiliarPagoDto,
} from './dto/update-salario-familiar.dto';
import { SalarioFamiliarConyuge } from './salario_familiar_conyuge.entity';
import {
  SalarioFamiliarHijo,
  SalarioFamiliarMotivoBaja,
} from './salario_familiar_hijo.entity';
import { SalarioFamiliarPago } from './salario_familiar_pago.entity';
import {
  SalarioFamiliar,
  SalarioFamiliarEstadoCivil,
  SalarioFamiliarPersonaTipo,
} from './salario_familiar.entity';

@Injectable()
export class SalarioFamiliarService {
  constructor(
    @InjectRepository(SalarioFamiliar)
    private readonly repo: Repository<SalarioFamiliar>,
    @InjectRepository(SalarioFamiliarConyuge)
    private readonly conyugeRepo: Repository<SalarioFamiliarConyuge>,
    @InjectRepository(SalarioFamiliarHijo)
    private readonly hijoRepo: Repository<SalarioFamiliarHijo>,
    @InjectRepository(SalarioFamiliarPago)
    private readonly pagoRepo: Repository<SalarioFamiliarPago>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NoDocente)
    private readonly noDocenteRepo: Repository<NoDocente>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(params: { activo?: string; search?: string; schoolId?: string }) {
    let query = this.repo
      .createQueryBuilder('salarioFamiliar')
      .leftJoinAndSelect('salarioFamiliar.docente', 'docente')
      .leftJoinAndSelect('salarioFamiliar.noDocente', 'noDocente')
      .leftJoinAndSelect('salarioFamiliar.conyuges', 'conyuges')
      .leftJoinAndSelect('salarioFamiliar.hijos', 'hijos')
      .leftJoinAndSelect('salarioFamiliar.pagos', 'pagos')
      .orderBy('salarioFamiliar.fechaSistema', 'DESC')
      .addOrderBy('hijos.fechaNacimiento', 'ASC')
      .addOrderBy('pagos.fechaSolicitud', 'DESC');

    if (params.activo === 'true') {
      query = query.where('salarioFamiliar.activo = :activo', { activo: true });
    } else if (params.activo === 'false') {
      query = query.where('salarioFamiliar.activo = :activo', { activo: false });
    }

    if (params.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.andWhere(
        `(
          docente.apellido ILIKE :term OR
          docente.nombre ILIKE :term OR
          docente.dni ILIKE :term OR
          noDocente.apellido ILIKE :term OR
          noDocente.nombre ILIKE :term OR
          noDocente.dni ILIKE :term OR
          conyuges.apellido ILIKE :term OR
          conyuges.nombre ILIKE :term OR
          hijos.apellido ILIKE :term OR
          hijos.nombre ILIKE :term OR
          hijos.dni ILIKE :term
        )`,
        { term },
      );
    }

    if (params.schoolId) {
      query = query.andWhere('salarioFamiliar.schoolId = :schoolId', { schoolId: params.schoolId });
    }

    const items = await query.getMany();
    return items.map((item) => this.mapResponse(item));
  }

  async findOne(id: string) {
    const entity = await this.getEntityOrThrow(id);
    return this.mapResponse(entity);
  }

  async getPersonas() {
    const [docentes, noDocentes] = await Promise.all([
      this.userRepo.find({ order: { apellido: 'ASC', nombre: 'ASC' } }),
      this.noDocenteRepo.find({ order: { apellido: 'ASC', nombre: 'ASC' } }),
    ]);

    return {
      docentes: docentes.map((d) => ({
        id: d.id,
        dni: d.dni,
        apellido: d.apellido,
        nombre: d.nombre,
      })),
      noDocentes: noDocentes.map((nd) => ({
        id: nd.id,
        dni: nd.dni,
        apellido: nd.apellido,
        nombre: nd.nombre,
      })),
    };
  }

  async create(data: CreateSalarioFamiliarDto, schoolId?: string) {
    await this.validarDatosPrincipales(data);

    const entity = new SalarioFamiliar();
    await this.mapearTitular(entity, data);
    entity.estadoCivil = data.estadoCivil;
    entity.observacion = data.observacion?.trim() || null;
    entity.activo = true;
    if (schoolId) entity.schoolId = schoolId;

    const saved = await this.repo.save(entity);

    if (data.conyuge) {
      await this.upsertConyuge(saved, data.conyuge);
    }
    if (data.hijos?.length) {
      await this.upsertHijos(saved, data.hijos);
    }

    const finalEntity = await this.getEntityOrThrow(saved.id);
    await this.registrarNovedad('ALTA DE SALARIO FAMILIAR', finalEntity, {
      estadoCivil: finalEntity.estadoCivil,
      cantidadHijosActivos: finalEntity.hijos.filter((h) => h.activo).length,
      conyugeActivo: finalEntity.conyuges.some((c) => c.activo),
    });
    return this.mapResponse(finalEntity);
  }

  async update(id: string, data: UpdateSalarioFamiliarDto) {
    const entity = await this.getEntityOrThrow(id);

    const merged = {
      personaTipo: data.personaTipo ?? entity.personaTipo,
      docenteId: data.docenteId ?? entity.docente?.id,
      noDocenteId: data.noDocenteId ?? entity.noDocente?.id,
      estadoCivil: data.estadoCivil ?? entity.estadoCivil,
      observacion: data.observacion ?? (entity.observacion ?? undefined),
      conyuge: data.conyuge,
      hijos: data.hijos,
    };

    await this.validarDatosPrincipales(merged, entity);

    await this.mapearTitular(entity, merged);
    entity.estadoCivil = merged.estadoCivil;
    entity.observacion = merged.observacion?.trim() || null;
    entity.fechaModificacion = new Date().toISOString().split('T')[0];
    await this.repo.save(entity);

    if (data.conyuge) {
      await this.upsertConyuge(entity, data.conyuge);
    }
    if (data.hijos?.length) {
      await this.upsertHijos(entity, data.hijos);
    }

    const finalEntity = await this.getEntityOrThrow(id);
    await this.registrarNovedad('EDICION DE SALARIO FAMILIAR', finalEntity, {
      estadoCivil: finalEntity.estadoCivil,
      actualizaConyuge: Boolean(data.conyuge),
      hijosInformados: data.hijos?.length ?? 0,
    });
    return this.mapResponse(finalEntity);
  }

  async darBajaConyuge(id: string, data: BajaSalarioFamiliarDependienteDto) {
    const conyuge = await this.conyugeRepo.findOne({
      where: { id },
      relations: ['salarioFamiliar'],
    });
    if (!conyuge) {
      throw new NotFoundException('Conyuge no encontrado');
    }
    if (!conyuge.activo) {
      throw new BadRequestException('El conyuge ya se encuentra dado de baja');
    }

    conyuge.activo = false;
    conyuge.fechaBaja = data.fechaBaja;
    conyuge.motivoBaja = data.motivoBaja;
    conyuge.fechaModificacion = new Date().toISOString().split('T')[0];
    await this.conyugeRepo.save(conyuge);

    const entity = await this.getEntityOrThrow(conyuge.salarioFamiliar.id);
    await this.registrarNovedad('BAJA DE CONYUGE EN SALARIO FAMILIAR', entity, {
      conyugeId: conyuge.id,
      fechaBaja: conyuge.fechaBaja,
      motivoBaja: conyuge.motivoBaja,
    });

    return this.mapResponse(entity);
  }

  async darBajaHijo(id: string, data: BajaSalarioFamiliarDependienteDto) {
    const hijo = await this.hijoRepo.findOne({
      where: { id },
      relations: ['salarioFamiliar'],
    });
    if (!hijo) {
      throw new NotFoundException('Hijo no encontrado');
    }
    if (!hijo.activo) {
      throw new BadRequestException('El hijo ya se encuentra dado de baja');
    }

    hijo.activo = false;
    hijo.fechaBaja = data.fechaBaja;
    hijo.motivoBaja = data.motivoBaja;
    hijo.fechaModificacion = new Date().toISOString().split('T')[0];
    await this.hijoRepo.save(hijo);

    const entity = await this.getEntityOrThrow(hijo.salarioFamiliar.id);
    await this.registrarNovedad('BAJA DE HIJO EN SALARIO FAMILIAR', entity, {
      hijoId: hijo.id,
      fechaBaja: hijo.fechaBaja,
      motivoBaja: hijo.motivoBaja,
    });

    return this.mapResponse(entity);
  }

  async createPago(id: string, data: CreateSalarioFamiliarPagoDto) {
    const entity = await this.getEntityOrThrow(id);
    const pago = this.pagoRepo.create({
      salarioFamiliar: entity,
      tipoAsignacion: data.tipoAsignacion,
      fechaSolicitud: data.fechaSolicitud,
      periodoLiquidacion: data.periodoLiquidacion,
      observacion: data.observacion?.trim() || null,
    });
    await this.pagoRepo.save(pago);

    const finalEntity = await this.getEntityOrThrow(id);
    await this.registrarNovedad('ALTA DE PAGO EN SALARIO FAMILIAR', finalEntity, {
      pagoId: pago.id,
      tipoAsignacion: pago.tipoAsignacion,
      fechaSolicitud: pago.fechaSolicitud,
      periodoLiquidacion: pago.periodoLiquidacion,
    });

    return this.mapResponse(finalEntity);
  }

  async updatePago(id: string, data: UpdateSalarioFamiliarPagoDto) {
    const pago = await this.pagoRepo.findOne({
      where: { id },
      relations: ['salarioFamiliar'],
    });
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    pago.tipoAsignacion = data.tipoAsignacion ?? pago.tipoAsignacion;
    pago.fechaSolicitud = data.fechaSolicitud ?? pago.fechaSolicitud;
    pago.periodoLiquidacion = data.periodoLiquidacion ?? pago.periodoLiquidacion;
    pago.observacion = data.observacion?.trim() ?? pago.observacion ?? null;
    pago.fechaModificacion = new Date().toISOString().split('T')[0];

    await this.pagoRepo.save(pago);

    const entity = await this.getEntityOrThrow(pago.salarioFamiliar.id);
    await this.registrarNovedad('EDICION DE PAGO EN SALARIO FAMILIAR', entity, {
      pagoId: pago.id,
      tipoAsignacion: pago.tipoAsignacion,
    });

    return this.mapResponse(entity);
  }

  private async validarDatosPrincipales(
    data: {
      personaTipo: SalarioFamiliarPersonaTipo;
      docenteId?: string;
      noDocenteId?: string;
      estadoCivil: SalarioFamiliarEstadoCivil;
      conyuge?: SalarioFamiliarConyugeDto | UpdateSalarioFamiliarConyugeDto;
      hijos?: Array<SalarioFamiliarHijoDto | UpdateSalarioFamiliarHijoDto>;
    },
    current?: SalarioFamiliar,
  ) {
    if (!data.personaTipo) {
      throw new BadRequestException('personaTipo es requerido');
    }
    if (!data.estadoCivil) {
      throw new BadRequestException('estadoCivil es requerido');
    }

    if (data.personaTipo === SalarioFamiliarPersonaTipo.DOCENTE && !data.docenteId) {
      throw new BadRequestException('docenteId es requerido para personaTipo DOCENTE');
    }
    if (data.personaTipo === SalarioFamiliarPersonaTipo.NO_DOCENTE && !data.noDocenteId) {
      throw new BadRequestException('noDocenteId es requerido para personaTipo NO_DOCENTE');
    }

    const conyugeActivoActual = current?.conyuges?.find((item) => item.activo);
    if (
      data.estadoCivil !== SalarioFamiliarEstadoCivil.CASADO_A &&
      (data.conyuge || conyugeActivoActual)
    ) {
      throw new BadRequestException(
        'Solo se puede informar o mantener conyuge activo si el estado civil es CASADO_A',
      );
    }

    if (data.conyuge) {
      this.validarDependientePagoSalario(data.conyuge.pagoSalario, data.conyuge.motivoNoPago, 'conyuge');
    }

    if (data.hijos && data.hijos.length > 8) {
      throw new BadRequestException('No se pueden informar mas de 8 hijos');
    }

    if (data.hijos?.length) {
      const dniSet = new Set<string>();
      const cuilSet = new Set<string>();
      for (const hijo of data.hijos) {
        const dni = hijo.dni?.trim();
        const cuil = hijo.cuil?.trim();
        if (dni && dniSet.has(dni)) {
          throw new BadRequestException(`DNI de hijo duplicado: ${dni}`);
        }
        if (cuil && cuilSet.has(cuil)) {
          throw new BadRequestException(`CUIL de hijo duplicado: ${cuil}`);
        }
        if (dni) dniSet.add(dni);
        if (cuil) cuilSet.add(cuil);
        this.validarDependientePagoSalario(hijo.pagoSalario, hijo.motivoNoPago, `hijo ${dni || ''}`.trim());
      }
    }
  }

  private validarDependientePagoSalario(
    pagoSalario?: boolean,
    motivoNoPago?: string,
    label?: string,
  ) {
    if (pagoSalario === false && !motivoNoPago?.trim()) {
      throw new BadRequestException(`motivoNoPago es requerido para ${label || 'el dependiente'}`);
    }
  }

  private async mapearTitular(
    entity: SalarioFamiliar,
    data: {
      personaTipo: SalarioFamiliarPersonaTipo;
      docenteId?: string;
      noDocenteId?: string;
    },
  ) {
    entity.personaTipo = data.personaTipo;

    if (data.personaTipo === SalarioFamiliarPersonaTipo.DOCENTE) {
      const docente = await this.userRepo.findOne({ where: { id: data.docenteId } });
      if (!docente) {
        throw new BadRequestException('Docente no encontrado');
      }
      entity.docente = docente;
      entity.noDocente = null;
      return;
    }

    const noDocente = await this.noDocenteRepo.findOne({ where: { id: data.noDocenteId } });
    if (!noDocente) {
      throw new BadRequestException('No Docente no encontrado');
    }
    entity.noDocente = noDocente;
    entity.docente = null;
  }

  private async upsertConyuge(
    entity: SalarioFamiliar,
    data: SalarioFamiliarConyugeDto | UpdateSalarioFamiliarConyugeDto,
  ) {
    const current = entity.conyuges?.find((item) => item.activo);
    let conyuge: SalarioFamiliarConyuge | null = null;

    if (data.id) {
      conyuge = await this.conyugeRepo.findOne({ where: { id: data.id } });
      if (!conyuge) {
        throw new NotFoundException('Conyuge no encontrado');
      }
      if (!conyuge.activo) {
        throw new BadRequestException('No se puede editar un conyuge dado de baja');
      }
    } else if (current) {
      conyuge = current;
    }

    if (!conyuge) {
      conyuge = this.conyugeRepo.create({ salarioFamiliar: entity });
    }

    conyuge.apellido = data.apellido?.trim() || conyuge.apellido;
    conyuge.nombre = data.nombre?.trim() || conyuge.nombre;
    conyuge.dni = data.dni?.trim() || conyuge.dni;
    conyuge.direccion = data.direccion?.trim() || null;
    conyuge.telefono = data.telefono?.trim() || null;
    conyuge.pagoSalario = data.pagoSalario ?? conyuge.pagoSalario ?? true;
    conyuge.motivoNoPago = conyuge.pagoSalario ? null : data.motivoNoPago?.trim() || null;
    conyuge.activo = true;
    conyuge.fechaBaja = null;
    conyuge.motivoBaja = null;
    conyuge.fechaModificacion = new Date().toISOString().split('T')[0];

    await this.conyugeRepo.save(conyuge);
  }

  private async upsertHijos(
    entity: SalarioFamiliar,
    hijos: Array<SalarioFamiliarHijoDto | UpdateSalarioFamiliarHijoDto>,
  ) {
    for (const child of hijos) {
      let hijo: SalarioFamiliarHijo | null = null;

      if (child.id) {
        hijo = await this.hijoRepo.findOne({ where: { id: child.id } });
        if (!hijo) {
          throw new NotFoundException(`Hijo no encontrado: ${child.id}`);
        }
        if (!hijo.activo) {
          throw new BadRequestException('No se puede editar un hijo dado de baja');
        }
      }

      if (!hijo) {
        hijo = this.hijoRepo.create({ salarioFamiliar: entity });
      }

      hijo.apellido = child.apellido?.trim() || hijo.apellido;
      hijo.nombre = child.nombre?.trim() || hijo.nombre;
      hijo.dni = child.dni?.trim() || hijo.dni;
      hijo.cuil = child.cuil?.trim() || hijo.cuil;
      hijo.fechaNacimiento = child.fechaNacimiento || hijo.fechaNacimiento;
      hijo.nivelEscolar = child.nivelEscolar || hijo.nivelEscolar;
      hijo.discapacidad = child.discapacidad ?? hijo.discapacidad ?? false;
      hijo.pagoSalario = child.pagoSalario ?? hijo.pagoSalario ?? true;
      hijo.motivoNoPago = hijo.pagoSalario ? null : child.motivoNoPago?.trim() || null;
      hijo.activo = true;
      hijo.fechaBaja = null;
      hijo.motivoBaja = null;
      hijo.fechaModificacion = new Date().toISOString().split('T')[0];

      await this.hijoRepo.save(hijo);
    }
  }

  private async getEntityOrThrow(id: string) {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['conyuges', 'hijos', 'pagos'],
    });
    if (!entity) {
      throw new NotFoundException('Registro de salario familiar no encontrado');
    }
    return entity;
  }

  private mapResponse(entity: SalarioFamiliar) {
    const conyuges = (entity.conyuges ?? []).map((conyuge) => ({
      ...conyuge,
    }));
    const hijos = (entity.hijos ?? []).map((hijo) => ({
      ...hijo,
      edad: this.calcularEdad(hijo.fechaNacimiento),
    }));
    const pagos = entity.pagos ?? [];

    return {
      ...entity,
      conyuges,
      conyugeActivo: conyuges.find((item) => item.activo) ?? null,
      hijos,
      hijosActivos: hijos.filter((item) => item.activo),
      hijosDadosDeBaja: hijos.filter((item) => !item.activo),
      cantidadHijosActivos: hijos.filter((item) => item.activo).length,
      pagos,
    };
  }

  private calcularEdad(fechaNacimiento?: string | null) {
    if (!fechaNacimiento) {
      return null;
    }

    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      edad -= 1;
    }

    return edad;
  }

  private async registrarNovedad(accion: string, salarioFamiliar: SalarioFamiliar, cambios: any) {
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const persona =
      salarioFamiliar.personaTipo === SalarioFamiliarPersonaTipo.DOCENTE
        ? `${salarioFamiliar.docente?.apellido || ''} ${salarioFamiliar.docente?.nombre || ''}`.trim()
        : `${salarioFamiliar.noDocente?.apellido || ''} ${salarioFamiliar.noDocente?.nombre || ''}`.trim();

    const novedad = novedadRepo.create({
      accion,
      usuario: persona || 'SIN_PERSONA',
      observaciones: 'SALARIO FAMILIAR',
      cambios,
      salarioFamiliar,
    });

    await novedadRepo.save(novedad);
  }
}