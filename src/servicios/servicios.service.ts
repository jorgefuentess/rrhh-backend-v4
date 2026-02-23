import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Servicio } from './servicio.entity';
import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';

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
  ) { }

  async findAll(activo?: string) {
    const where: any = {};
    
    if (activo === 'true') {
      where.activo = true;
    } else if (activo === 'false') {
      where.activo = false;
    }
    // Si no se especifica, devuelve todos

    return this.repo.find({
      where,
      relations: ['user', 'nivel', 'seccion', 'materia'],
      order: { fechaToma: 'DESC' },
    });
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

    // Atributos simples
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.puntos = data.puntos;
    entidad.cantHs = data.cantHs;
    entidad.caracter = data.caracter;
    entidad.fechaToma = data.fechaToma;

    const saved = await this.repo.save(entidad);
    console.log('✅ Servicio creado correctamente:', saved);
    return saved;
  }

  async update(id: string, data: any) {
    // 1️⃣ Buscar servicio existente
    const entidad = await this.repo.findOne({
      where: { id },
      relations: ['user', 'nivel', 'seccion', 'materia'],
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

    // 4️⃣ Atributos simples
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.puntos = data.puntos;
    entidad.cantHs = data.cantHs;
    entidad.caracter = data.caracter;
    entidad.fechaToma = data.fechaToma;

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
      codigoCargo: data.codigoCargo,
      cargo: data.cargo,
      puntos: data.puntos,
      cantHs: data.cantHs,
      caracter: data.caracter,
      fechaToma: data.fechaToma,
    };
    const novedad = novedadRepo.create({
      accion: 'EDICION DE SERVICIO',
      servicio: updated,
      usuario: updatedWithRelations?.user?.apellido + ' ' + updatedWithRelations?.user?.nombre,
      cambios: cambios,
    });
    console.log('✓ Novedad de servicio creada:', { usuario: novedad.usuario, accion: novedad.accion });
    await novedadRepo.save(novedad);

    console.log('✏️ Servicio actualizado correctamente:', updated);
    return updated;
  }

  async darBaja(id: string, motivo: string) {
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

    // Dar de baja
    servicio.activo = false;
    servicio.fechaBaja = new Date().toISOString().split('T')[0];
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
    console.log('✓ Novedad de baja de servicio creada:', { usuario: novedad.usuario, accion: novedad.accion });
    await novedadRepo.save(novedad);

    console.log('📉 Servicio dado de baja correctamente:', updated);
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
    console.log('✓ Novedad de reactivación de servicio creada:', { usuario: novedad.usuario, accion: novedad.accion });
    await novedadRepo.save(novedad);

    console.log('✏️ Servicio dado de alta correctamente:', updated);
    return updated;
  }

  remove(id: string) { return this.repo.delete(id); }

}