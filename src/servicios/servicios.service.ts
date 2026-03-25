import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Servicio } from './servicio.entity';
import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';
import { Escuela } from '../escuela/escuela.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Nivel)
    private readonly nivelRepo: Repository<Nivel>,

    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,

    @InjectRepository(Materia)
    private readonly materiaRepo: Repository<Materia>,

    @InjectRepository(Escuela)
    private readonly escuelaRepo: Repository<Escuela>,
  ) { }

  async findAll(activo?: string, search?: string) {
    let query = this.repo.createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.user', 'user')
      .leftJoinAndSelect('servicio.nivel', 'nivel')
      .leftJoinAndSelect('servicio.seccion', 'seccion')
      .leftJoinAndSelect('servicio.materia', 'materia')
      .leftJoinAndSelect('servicio.escuela', 'escuela')
      .orderBy('servicio.fechaToma', 'DESC');

    if (activo === 'true') {
      query = query.where('servicio.activo = :activo', { activo: true });
    } else if (activo === 'false') {
      query = query.where('servicio.activo = :activo', { activo: false });
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.andWhere(
        `(
          user.dni ILIKE :search OR
          user.apellido ILIKE :search OR
          user.nombre ILIKE :search OR
          servicio.materiaNombre ILIKE :search OR
          servicio.cargo ILIKE :search OR
          servicio.codigoCargo ILIKE :search OR
          servicio.nivelNombre ILIKE :search OR
          servicio.turno ILIKE :search
        )`,
        { search: searchTerm }
      );
    }

    return query.getMany();
  }

  async create(data: any) {
    if (!data.user?.id) {
      throw new BadRequestException('user.id es requerido');
    }

    const entidad = new Servicio();

    // Relaciones
    entidad.user = await this.userRepo.findOneOrFail({ where: { id: data.user.id } });
    entidad.nivel = data.nivel?.id
      ? await this.nivelRepo.findOne({ where: { id: data.nivel.id } })
      : null;
    entidad.seccion = data.seccion?.id
      ? await this.seccionRepo.findOne({ where: { id: data.seccion.id } })
      : null;
    entidad.materia = data.materia?.id
      ? await this.materiaRepo.findOne({ where: { id: data.materia.id } })
      : null;
    entidad.escuela = data.escuela?.id
      ? await this.escuelaRepo.findOne({ where: { id: data.escuela.id } })
      : null;

    const nivelNombre = String(data.nivelNombre ?? '').trim();
    const turno = String(data.turno ?? '').trim();
    const seccionNombre = String(data.seccionNombre ?? '').trim();
    const materiaNombre = String(data.materiaNombre ?? '').trim();
    const puntos = Number(data.puntos);
    const cantHs = Number(data.cantHs);

    if (!nivelNombre) throw new BadRequestException('nivelNombre es requerido');
    if (!turno) throw new BadRequestException('turno es requerido');
    if (!seccionNombre) throw new BadRequestException('seccionNombre es requerido');
    if (!materiaNombre) throw new BadRequestException('materiaNombre es requerido');
    if (!Number.isFinite(puntos) || puntos < 0) throw new BadRequestException('puntos inválido');
    if (!Number.isFinite(cantHs) || cantHs < 0) throw new BadRequestException('cantHs inválido');

    // Atributos simples
    entidad.nivelNombre = nivelNombre;
    entidad.turno = turno;
    entidad.seccionNombre = seccionNombre;
    entidad.materiaNombre = materiaNombre;
    entidad.tipoMateria = data.tipoMateria ? String(data.tipoMateria).trim() : null;
    entidad.condicionMateria = data.condicionMateria ? String(data.condicionMateria).trim() : null;
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.puntos = puntos;
    entidad.cantHs = cantHs;
    entidad.caracter = data.caracter;
    entidad.fechaToma = data.fechaToma;
    entidad.boleta = data.boleta;

    const saved = await this.repo.save(entidad);
    return saved;
  }

  async update(id: string, data: any) {
    // 1️⃣ Buscar servicio existente
    const entidad = await this.repo.findOne({
      where: { id },
      relations: ['user', 'nivel', 'seccion', 'materia', 'escuela'],
    });

    if (!entidad) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // 2️⃣ Validar usuario
    if (!data.user?.id) {
      throw new BadRequestException('user.id es requerido');
    }

    entidad.user = await this.userRepo.findOneOrFail({
      where: { id: data.user.id },
    });

    // 3️⃣ Relaciones opcionales
    entidad.nivel = data.nivel?.id
      ? await this.nivelRepo.findOne({ where: { id: data.nivel.id } })
      : null;

    entidad.seccion = data.seccion?.id
      ? await this.seccionRepo.findOne({ where: { id: data.seccion.id } })
      : null;

    entidad.materia = data.materia?.id
      ? await this.materiaRepo.findOne({ where: { id: data.materia.id } })
      : null;

    entidad.escuela = data.escuela?.id
      ? await this.escuelaRepo.findOne({ where: { id: data.escuela.id } })
      : null;

    const nivelNombre = String(data.nivelNombre ?? '').trim();
    const turno = String(data.turno ?? '').trim();
    const seccionNombre = String(data.seccionNombre ?? '').trim();
    const materiaNombre = String(data.materiaNombre ?? '').trim();
    const puntos = Number(data.puntos);
    const cantHs = Number(data.cantHs);

    if (!nivelNombre) throw new BadRequestException('nivelNombre es requerido');
    if (!turno) throw new BadRequestException('turno es requerido');
    if (!seccionNombre) throw new BadRequestException('seccionNombre es requerido');
    if (!materiaNombre) throw new BadRequestException('materiaNombre es requerido');
    if (!Number.isFinite(puntos) || puntos < 0) throw new BadRequestException('puntos inválido');
    if (!Number.isFinite(cantHs) || cantHs < 0) throw new BadRequestException('cantHs inválido');

    // 4️⃣ Atributos simples
    entidad.nivelNombre = nivelNombre;
    entidad.turno = turno;
    entidad.seccionNombre = seccionNombre;
    entidad.materiaNombre = materiaNombre;
    entidad.tipoMateria = data.tipoMateria ? String(data.tipoMateria).trim() : null;
    entidad.condicionMateria = data.condicionMateria ? String(data.condicionMateria).trim() : null;
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.puntos = puntos;
    entidad.cantHs = cantHs;
    entidad.caracter = data.caracter;
    entidad.fechaToma = data.fechaToma;
    entidad.boleta = data.boleta;

    // 5️⃣ Guardar
    const updated = await this.repo.save(entidad);

    // Recargar la entidad con relaciones para acceder a user
    const updatedWithRelations = await this.repo.findOne({
      where: { id: updated.id },
      relations: ['user'],
    });

    // Registrar novedad por edición de servicio con cambios
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const cambios = {
      nivelNombre,
      turno,
      seccionNombre,
      materiaNombre,
      tipoMateria: entidad.tipoMateria,
      condicionMateria: entidad.condicionMateria,
      codigoCargo: data.codigoCargo,
      cargo: data.cargo,
      puntos,
      cantHs,
      caracter: data.caracter,
      fechaToma: data.fechaToma,
      boleta: data.boleta,
    };
    const novedad = novedadRepo.create({
      accion: 'EDICION DE SERVICIO',
      servicio: updated,
      usuario: updatedWithRelations?.user?.apellido + ' ' + updatedWithRelations?.user?.nombre,
      cambios: cambios,
    });
    await novedadRepo.save(novedad);

    return updated;
  }

  async darBaja(id: string, motivo: string, fechaBaja?: string) {
    const servicio = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (!servicio.activo) {
      throw new BadRequestException('El servicio ya está dado de baja');
    }

    if (!motivo) {
      throw new BadRequestException('El motivo de baja es requerido');
    }

    if (fechaBaja && Number.isNaN(Date.parse(fechaBaja))) {
      throw new BadRequestException('La fecha de baja es inválida');
    }

    // Dar de baja
    servicio.activo = false;
    servicio.fechaBaja = fechaBaja || new Date().toISOString().split('T')[0];
    servicio.motivoBaja = motivo;

    const updated = await this.repo.save(servicio);

    // Registrar novedad
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'BAJA DE SERVICIO DOCENTE',
      servicio: updated,
      usuario: servicio.user?.apellido + ' ' + servicio.user?.nombre,
      cambios: {
        motivo: motivo,
        fechaBaja: servicio.fechaBaja,
      },
    });
    await novedadRepo.save(novedad);

    return updated;
  }

  async darAlta(id: string) {
    const servicio = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.activo) {
      throw new BadRequestException('El servicio ya está activo');
    }

    // Dar de alta
    servicio.activo = true;
    servicio.fechaBaja = undefined;
    servicio.motivoBaja = undefined;

    const updated = await this.repo.save(servicio);

    // Registrar novedad
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'REACTIVACION DE SERVICIO DOCENTE',
      servicio: updated,
      usuario: servicio.user?.apellido + ' ' + servicio.user?.nombre,
      cambios: {
        estado: 'activo',
      },
    });
    await novedadRepo.save(novedad);

    return updated;
  }

  remove(id: string) { return this.repo.delete(id); }

}