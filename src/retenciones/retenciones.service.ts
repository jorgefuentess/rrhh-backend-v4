import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Retencion, RetencionPersonaTipo, RetencionTipo } from './retencion.entity';
import { RetencionBoleta } from './retencion-boleta.entity';
import { CreateRetencionDto } from './dto/create-retencion.dto';
import { UpdateRetencionDto } from './dto/update-retencion.dto';
import { User } from '../users/user.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';

@Injectable()
export class RetencionesService implements OnModuleInit, OnModuleDestroy {
  private autoBajaTimer: NodeJS.Timeout | null = null;
  private ultimaEjecucionAutomatica = '';

  constructor(
    @InjectRepository(Retencion)
    private readonly repo: Repository<Retencion>,
    @InjectRepository(RetencionBoleta)
    private readonly boletaRepo: Repository<RetencionBoleta>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NoDocente)
    private readonly noDocenteRepo: Repository<NoDocente>,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.autoBajaTimer = setInterval(() => {
      this.ejecutarBajaAutomaticaDiaria().catch((err) => {
        console.error('Error en baja automatica de retenciones:', err);
      });
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.autoBajaTimer) {
      clearInterval(this.autoBajaTimer);
      this.autoBajaTimer = null;
    }
  }

  async findAll(params: {
    activo?: string;
    tipoRetencion?: RetencionTipo;
    search?: string;
    schoolId?: string;
  }) {
    let query = this.repo
      .createQueryBuilder('retencion')
      .leftJoinAndSelect('retencion.docente', 'docente')
      .leftJoinAndSelect('retencion.noDocente', 'noDocente')
      .leftJoinAndSelect('retencion.boletas', 'boletas')
      .orderBy('retencion.fechaSistema', 'DESC')
      .addOrderBy('boletas.orden', 'ASC');

    if (params.activo === 'true') {
      query = query.where('retencion.activo = :activo', { activo: true });
    } else if (params.activo === 'false') {
      query = query.where('retencion.activo = :activo', { activo: false });
    }

    if (params.tipoRetencion) {
      query = query.andWhere('retencion.tipoRetencion = :tipoRetencion', {
        tipoRetencion: params.tipoRetencion,
      });
    }

    if (params.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.andWhere(
        `(
          retencion.expedienteOficio ILIKE :term OR
          retencion.caratula ILIKE :term OR
          docente.apellido ILIKE :term OR
          docente.nombre ILIKE :term OR
          docente.dni ILIKE :term OR
          noDocente.apellido ILIKE :term OR
          noDocente.nombre ILIKE :term OR
          noDocente.dni ILIKE :term
        )`,
        { term },
      );
    }

    if (params.schoolId) {
      query = query.andWhere('retencion.schoolId = :schoolId', { schoolId: params.schoolId });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const retencion = await this.repo.findOne({ where: { id } });
    if (!retencion) {
      throw new NotFoundException('Retencion no encontrada');
    }
    return retencion;
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

  async create(data: CreateRetencionDto, schoolId?: string) {
    this.validarDatosComunes(data);

    const entidad = new Retencion();
    if (schoolId) entidad.schoolId = schoolId;
    await this.mapearRetencion(entidad, data);

    const saved = await this.repo.save(entidad);
    await this.persistirBoletas(saved, data.boletas ?? []);

    const finalEntity = await this.findOne(saved.id);
    await this.registrarNovedad('ALTA DE RETENCION', finalEntity, {
      tipoRetencion: finalEntity.tipoRetencion,
      personaTipo: finalEntity.personaTipo,
      expedienteOficio: finalEntity.expedienteOficio,
      boletas: (finalEntity.boletas ?? []).map((b) => b.numeroBoleta),
    });

    return finalEntity;
  }

  async update(id: string, data: UpdateRetencionDto) {
    const entidad = await this.repo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException('Retencion no encontrada');
    }
    if (!entidad.activo) {
      throw new BadRequestException('No se puede editar una retencion dada de baja');
    }

    const merged: CreateRetencionDto = {
      tipoRetencion: data.tipoRetencion ?? entidad.tipoRetencion,
      personaTipo: data.personaTipo ?? entidad.personaTipo,
      docenteId: data.docenteId ?? entidad.docente?.id,
      noDocenteId: data.noDocenteId ?? entidad.noDocente?.id,
      expedienteOficio: data.expedienteOficio ?? entidad.expedienteOficio,
      caratula: data.caratula ?? (entidad.caratula ?? undefined),
      pensionPorcentaje: data.pensionPorcentaje ?? (entidad.pensionPorcentaje ?? undefined),
      pensionImporte: data.pensionImporte ?? (entidad.pensionImporte ?? undefined),
      pensionCuentaJudicial:
        data.pensionCuentaJudicial ?? (entidad.pensionCuentaJudicial ?? undefined),
      embargoCuentaJudicialCapital:
        data.embargoCuentaJudicialCapital ?? (entidad.embargoCuentaJudicialCapital ?? undefined),
      embargoCuentaJudicialHonorarios:
        data.embargoCuentaJudicialHonorarios ??
        (entidad.embargoCuentaJudicialHonorarios ?? undefined),
      embargoMontoCapital: data.embargoMontoCapital ?? (entidad.embargoMontoCapital ?? undefined),
      embargoMontoHonorarios:
        data.embargoMontoHonorarios ?? (entidad.embargoMontoHonorarios ?? undefined),
      inicioRetencion: data.inicioRetencion ?? this.dateToMonthYear(entidad.inicioRetencion),
      finRetencion: data.finRetencion ?? this.dateToMonthYear(entidad.finRetencion),
      cantidadCuotas: data.cantidadCuotas ?? (entidad.cantidadCuotas ?? undefined),
      importeTotalCuota: data.importeTotalCuota ?? (entidad.importeTotalCuota ?? undefined),
      observacion: data.observacion ?? (entidad.observacion ?? undefined),
      boletas: data.boletas,
    };

    this.validarDatosComunes(merged);

    await this.mapearRetencion(entidad, merged);
    entidad.fechaModificacion = new Date().toISOString().split('T')[0];

    await this.repo.save(entidad);

    if (data.boletas) {
      await this.persistirBoletas(entidad, data.boletas);
    }

    const finalEntity = await this.findOne(entidad.id);

    await this.registrarNovedad('EDICION DE RETENCION', finalEntity, {
      tipoRetencion: finalEntity.tipoRetencion,
      expedienteOficio: finalEntity.expedienteOficio,
      boletasActualizadas: Boolean(data.boletas),
    });

    return finalEntity;
  }

  async darBaja(id: string, body: { motivo?: string; fechaBaja?: string; expedienteOficio?: string }) {
    const entidad = await this.repo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException('Retencion no encontrada');
    }

    if (!entidad.activo) {
      throw new BadRequestException('La retencion ya esta dada de baja');
    }

    if (body.fechaBaja && Number.isNaN(Date.parse(body.fechaBaja))) {
      throw new BadRequestException('fechaBaja invalida');
    }

    entidad.activo = false;
    entidad.bajaAutomatica = false;
    entidad.fechaBaja = body.fechaBaja || new Date().toISOString().split('T')[0];
    entidad.bajaExpedienteOficio = body.expedienteOficio?.trim() || null;
    entidad.motivoBaja = body.motivo?.trim() || null;

    const saved = await this.repo.save(entidad);

    await this.registrarNovedad('BAJA DE RETENCION', saved, {
      fechaBaja: saved.fechaBaja,
      bajaExpedienteOficio: saved.bajaExpedienteOficio,
      motivoBaja: saved.motivoBaja,
      automatica: false,
    });

    return saved;
  }

  async darAlta(id: string) {
    const entidad = await this.repo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException('Retencion no encontrada');
    }
    if (entidad.activo) {
      throw new BadRequestException('La retencion ya esta activa');
    }

    entidad.activo = true;
    entidad.fechaBaja = null;
    entidad.bajaExpedienteOficio = null;
    entidad.motivoBaja = null;
    entidad.bajaAutomatica = false;

    const saved = await this.repo.save(entidad);

    await this.registrarNovedad('REACTIVACION DE RETENCION', saved, {
      estado: 'ACTIVA',
    });

    return saved;
  }

  private async ejecutarBajaAutomaticaDiaria() {
    const now = new Date();
    const nowParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(now)
      .reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') {
          acc[part.type] = part.value;
        }
        return acc;
      }, {});

    const fechaClave = `${nowParts.year}-${nowParts.month}-${nowParts.day}`;
    const esMedianoche = nowParts.hour === '00' && nowParts.minute === '00';

    if (!esMedianoche || this.ultimaEjecucionAutomatica === fechaClave) {
      return;
    }

    this.ultimaEjecucionAutomatica = fechaClave;

    const activosEmbargo = await this.repo.find({
      where: {
        activo: true,
        tipoRetencion: RetencionTipo.EMBARGO,
      },
    });

    const hoy = new Date(`${fechaClave}T00:00:00`);

    for (const item of activosEmbargo) {
      if (!item.finRetencion) {
        continue;
      }

      const fin = new Date(item.finRetencion);
      const primerDiaMesSiguiente = new Date(
        fin.getUTCFullYear(),
        fin.getUTCMonth() + 1,
        1,
      );

      if (hoy < primerDiaMesSiguiente) {
        continue;
      }

      item.activo = false;
      item.bajaAutomatica = true;
      item.fechaBaja = fechaClave;
      item.motivoBaja = 'Baja automatica por fin de retencion';

      const saved = await this.repo.save(item);

      await this.registrarNovedad('BAJA AUTOMATICA DE RETENCION', saved, {
        finRetencion: saved.finRetencion,
        fechaBaja: saved.fechaBaja,
        automatica: true,
      });
    }
  }

  private validarDatosComunes(data: CreateRetencionDto) {
    if (!data.tipoRetencion) {
      throw new BadRequestException('tipoRetencion es requerido');
    }

    if (!data.personaTipo) {
      throw new BadRequestException('personaTipo es requerido');
    }

    if (data.personaTipo === RetencionPersonaTipo.DOCENTE && !data.docenteId) {
      throw new BadRequestException('docenteId es requerido para personaTipo DOCENTE');
    }

    if (data.personaTipo === RetencionPersonaTipo.NO_DOCENTE && !data.noDocenteId) {
      throw new BadRequestException('noDocenteId es requerido para personaTipo NO_DOCENTE');
    }

    if (!data.expedienteOficio?.trim()) {
      throw new BadRequestException('expedienteOficio es requerido');
    }

    if (data.inicioRetencion) {
      this.monthYearToDate(data.inicioRetencion);
    }

    if (data.finRetencion) {
      this.monthYearToDate(data.finRetencion);
    }

    if (
      data.tipoRetencion === RetencionTipo.PENSION_ALIMENTICIA &&
      data.pensionPorcentaje !== undefined &&
      (Number(data.pensionPorcentaje) < 0 || Number(data.pensionPorcentaje) > 100)
    ) {
      throw new BadRequestException('pensionPorcentaje debe estar entre 0 y 100');
    }

    if (data.tipoRetencion === RetencionTipo.EMBARGO) {
      if (
        data.embargoMontoCapital !== undefined &&
        (Number.isNaN(Number(data.embargoMontoCapital)) || Number(data.embargoMontoCapital) < 0)
      ) {
        throw new BadRequestException('embargoMontoCapital invalido');
      }
      if (
        data.embargoMontoHonorarios !== undefined &&
        (Number.isNaN(Number(data.embargoMontoHonorarios)) || Number(data.embargoMontoHonorarios) < 0)
      ) {
        throw new BadRequestException('embargoMontoHonorarios invalido');
      }
    }
  }

  private async mapearRetencion(entidad: Retencion, data: CreateRetencionDto) {
    entidad.tipoRetencion = data.tipoRetencion;
    entidad.personaTipo = data.personaTipo;

    if (data.personaTipo === RetencionPersonaTipo.DOCENTE) {
      const docente = await this.userRepo.findOne({ where: { id: data.docenteId } });
      if (!docente) {
        throw new BadRequestException('Docente no encontrado');
      }
      entidad.docente = docente;
      entidad.noDocente = null;
    } else {
      const noDocente = await this.noDocenteRepo.findOne({ where: { id: data.noDocenteId } });
      if (!noDocente) {
        throw new BadRequestException('No Docente no encontrado');
      }
      entidad.noDocente = noDocente;
      entidad.docente = null;
    }

    entidad.expedienteOficio = data.expedienteOficio.trim();
    entidad.caratula = data.caratula?.trim() || null;

    entidad.pensionPorcentaje =
      data.tipoRetencion === RetencionTipo.PENSION_ALIMENTICIA &&
      data.pensionPorcentaje !== undefined
        ? Number(data.pensionPorcentaje)
        : null;
    entidad.pensionImporte =
      data.tipoRetencion === RetencionTipo.PENSION_ALIMENTICIA &&
      data.pensionImporte !== undefined
        ? Number(data.pensionImporte)
        : null;
    entidad.pensionCuentaJudicial =
      data.tipoRetencion === RetencionTipo.PENSION_ALIMENTICIA
        ? data.pensionCuentaJudicial?.trim() || null
        : null;

    const capital =
      data.tipoRetencion === RetencionTipo.EMBARGO && data.embargoMontoCapital !== undefined
        ? Number(data.embargoMontoCapital)
        : null;
    const honorarios =
      data.tipoRetencion === RetencionTipo.EMBARGO &&
      data.embargoMontoHonorarios !== undefined
        ? Number(data.embargoMontoHonorarios)
        : null;

    entidad.embargoCuentaJudicialCapital =
      data.tipoRetencion === RetencionTipo.EMBARGO
        ? data.embargoCuentaJudicialCapital?.trim() || null
        : null;
    entidad.embargoCuentaJudicialHonorarios =
      data.tipoRetencion === RetencionTipo.EMBARGO
        ? data.embargoCuentaJudicialHonorarios?.trim() || null
        : null;
    entidad.embargoMontoCapital = capital;
    entidad.embargoMontoHonorarios = honorarios;
    entidad.embargoMontoTotal =
      data.tipoRetencion === RetencionTipo.EMBARGO
        ? Number((Number(capital || 0) + Number(honorarios || 0)).toFixed(2))
        : null;

    entidad.inicioRetencion = data.inicioRetencion
      ? this.monthYearToDate(data.inicioRetencion)
      : null;
    entidad.finRetencion = data.finRetencion ? this.monthYearToDate(data.finRetencion) : null;

    entidad.cantidadCuotas =
      data.cantidadCuotas !== undefined ? Number(data.cantidadCuotas) : null;
    entidad.importeTotalCuota =
      data.importeTotalCuota !== undefined ? Number(data.importeTotalCuota) : null;
    entidad.observacion = data.observacion?.trim() || null;
  }

  private async persistirBoletas(retencion: Retencion, boletas: Array<string | number>) {
    const cleaned = boletas
      .map((b) => String(b ?? '').trim())
      .filter((b) => b.length > 0);

    await this.boletaRepo.delete({ retencion: { id: retencion.id } as Retencion });

    if (!cleaned.length) {
      return;
    }

    const nuevas = cleaned.map((numeroBoleta, index) =>
      this.boletaRepo.create({
        retencion,
        numeroBoleta,
        orden: index,
      }),
    );

    await this.boletaRepo.save(nuevas);
  }

  private monthYearToDate(value: string): string {
    const match = /^([0][1-9]|1[0-2])\/(\d{4})$/.exec(String(value).trim());
    if (!match) {
      throw new BadRequestException('Formato invalido, debe ser mm/aaaa');
    }
    const month = match[1];
    const year = match[2];
    return `${year}-${month}-01`;
  }

  private dateToMonthYear(value?: string | null): string | undefined {
    if (!value) {
      return undefined;
    }
    const [year, month] = String(value).split('-');
    if (!year || !month) {
      return undefined;
    }
    return `${month}/${year}`;
  }

  private async registrarNovedad(accion: string, retencion: Retencion, cambios: any) {
    const novedadRepo = this.dataSource.getRepository(Novedad);

    const persona =
      retencion.personaTipo === RetencionPersonaTipo.DOCENTE
        ? `${retencion.docente?.apellido || ''} ${retencion.docente?.nombre || ''}`.trim()
        : `${retencion.noDocente?.apellido || ''} ${retencion.noDocente?.nombre || ''}`.trim();

    const novedad = novedadRepo.create({
      accion,
      usuario: persona || 'SIN_PERSONA',
      observaciones: `RETENCION ${retencion.tipoRetencion}`,
      cambios,
      retencion,
    });

    await novedadRepo.save(novedad);
  }
}
