import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ServicioNoDocente } from './servicionodocente.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';

@Injectable()
export class ServicioNoDocenteService {
  constructor(
    @InjectRepository(ServicioNoDocente)
    private readonly repo: Repository<ServicioNoDocente>,
    private readonly dataSource: DataSource,
    @InjectRepository(NoDocente)
    private readonly noDocenteRepo: Repository<NoDocente>,
  ) { }

  async findAll(activo?: string) {
    const where: any = {};

    if (activo === 'true') {
      where.activo = true;
    } else if (activo === 'false') {
      where.activo = false;
    }

    return this.repo.find({
      where,
      order: { fechaToma: 'DESC' },
    });
  }

  async create(data: any) {
    if (!data.noDocente?.id) {
      throw new BadRequestException('noDocente.id es requerido');
    }

    const entidad = new ServicioNoDocente();

    // Atributos simples
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.cantHs = data.cantHs;
    entidad.fechaToma = data.fechaToma;
    entidad.boleta = data.boleta;

    // Relación con NoDocente
    entidad.noDocente = data.noDocente;

    // 👇 CLAVE: al crear siempre NULL
    entidad.fechaModificacion = null;

    const saved = await this.repo.save(entidad);

    // Recargar con relaciones para acceder a noDocente
    const savedWithRelations = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['noDocente'],
    });

    // Registrar novedad por creación de servicio
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'ALTA DE SERVICIO NO DOCENTE',
      servicioNoDocente: saved,
      usuario: savedWithRelations?.noDocente?.apellido + ' ' + savedWithRelations?.noDocente?.nombre,
      cambios: {
        codigoCargo: data.codigoCargo,
        cargo: data.cargo,
        cantHs: data.cantHs,
        fechaToma: data.fechaToma,
        boleta: data.boleta,
      },
    });
    console.log('✓ Novedad de servicio no docente creada:', { usuario: novedad.usuario, accion: novedad.accion });
    await novedadRepo.save(novedad);

    console.log('✅ Servicio creado correctamente:', saved);
    return saved;
  }

  async update(id: string, data: any) {
    if (!data.noDocente?.id) {
      throw new BadRequestException('noDocente.id es requerido');
    }

    const entidad = await this.repo.findOne({ where: { id } });
    if (!entidad) {
      throw new BadRequestException('Servicio no encontrado');
    }

    // Atributos simples
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.cantHs = data.cantHs;
    entidad.fechaToma = data.fechaToma;
    entidad.boleta = data.boleta;

    // Relación con NoDocente
    entidad.noDocente = data.noDocente;

    // Actualizar fechaModificacion
    entidad.fechaModificacion = new Date().toISOString().split('T')[0];

    const updated = await this.repo.save(entidad);

    // Recargar con relaciones para acceder a noDocente
    const updatedWithRelations = await this.repo.findOne({
      where: { id: updated.id },
      relations: ['noDocente'],
    });

    // Registrar novedad por edición de servicio
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'EDICION DE SERVICIO NO DOCENTE',
      servicioNoDocente: updated,
      usuario: updatedWithRelations?.noDocente?.apellido + ' ' + updatedWithRelations?.noDocente?.nombre,
      cambios: {
        codigoCargo: data.codigoCargo,
        cargo: data.cargo,
        cantHs: data.cantHs,
        fechaToma: data.fechaToma,
        boleta: data.boleta,
      },
    });
    console.log('✓ Novedad de edición de servicio no docente creada:', { usuario: novedad.usuario, accion: novedad.accion });
    await novedadRepo.save(novedad);

    console.log('✏️ Servicio actualizado correctamente:', updated);
    return updated;
  }

  async darBaja(id: string, motivo: string, fechaBaja?: string) {
    const servicio = await this.repo.findOne({
      where: { id },
      relations: ['noDocente'],
    });

    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado');
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

    servicio.activo = false;
    servicio.fechaBaja = fechaBaja || new Date().toISOString().split('T')[0];
    servicio.motivoBaja = motivo;

    const updated = await this.repo.save(servicio);

    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'BAJA DE SERVICIO NO DOCENTE',
      servicioNoDocente: updated,
      usuario: servicio.noDocente?.apellido + ' ' + servicio.noDocente?.nombre,
      cambios: {
        motivo,
        fechaBaja: servicio.fechaBaja,
      },
    });
    await novedadRepo.save(novedad);

    return updated;
  }

  async darAlta(id: string) {
    const servicio = await this.repo.findOne({
      where: { id },
      relations: ['noDocente'],
    });

    if (!servicio) {
      throw new BadRequestException('Servicio no encontrado');
    }

    if (servicio.activo) {
      throw new BadRequestException('El servicio ya está activo');
    }

    servicio.activo = true;
    servicio.fechaBaja = undefined;
    servicio.motivoBaja = undefined;

    const updated = await this.repo.save(servicio);

    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'REACTIVACION DE SERVICIO NO DOCENTE',
      servicioNoDocente: updated,
      usuario: servicio.noDocente?.apellido + ' ' + servicio.noDocente?.nombre,
      cambios: {
        estado: 'activo',
      },
    });
    await novedadRepo.save(novedad);

    return updated;
  }

}