import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MiLicencia } from './milicencia.entity';
import { User } from '../users/user.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';

@Injectable()
export class MiLicenciasService {
  constructor(
    @InjectRepository(MiLicencia)
    private readonly licenciaRepository: Repository<MiLicencia>,
    private readonly dataSource: DataSource,
  ) { }

  async findAll(): Promise<MiLicencia[]> {
    return this.licenciaRepository.find();
  }

  async crear(archivo: Express.Multer.File, body: any) {
    if (!archivo) {
      throw new BadRequestException('Archivo requerido');
    }

    console.log("datos body", body)
    const licencia = this.licenciaRepository.create({
      tipo: body.tipo,
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaFin,
      observaciones: body.observaciones,
      nombre: archivo.originalname,
      tipoMime: archivo.mimetype,
      tamano: archivo.size,
      archivo: archivo.buffer,
      user: body.userId,
    });

    const saved = await this.licenciaRepository.save(licencia);

    // Recargar la entidad con relaciones para acceder a user y tipo
    const savedWithRelations = await this.licenciaRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'tipo'],
    });

    // Registrar novedad al crear licencia
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'CREACION DE LICENCIA',
      miLicencia: saved,
      usuario: savedWithRelations?.user?.apellido + ' ' + savedWithRelations?.user?.nombre,
      tipoLicencia: savedWithRelations?.tipo?.nombre,
      observaciones: savedWithRelations?.observaciones,
    });
    console.log('✓ Novedad creada:', { usuario: novedad.usuario, tipoLicencia: novedad.tipoLicencia });
    await novedadRepo.save(novedad);

    return saved;
  }


  async download(id: string) {
    const entity = await this.licenciaRepository.findOneBy({ id });

    if (!entity || !entity.archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return {
      buffer: entity.archivo,
      mimeType: entity.tipo, // image/jpeg | application/pdf
      fileName: entity.nombre ?? `archivo_${id}`,
    };
  }

  async getFile(id: string) {
    const licencia = await this.licenciaRepository.findOne({
      where: { id },
    });

    if (!licencia || !licencia.archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return {
      buffer: licencia.archivo,
      mimeType: licencia.tipoMime,
      fileName: licencia.nombre,
    };
  }

  async editar(
    id: string,
    archivo: Express.Multer.File,
    body: any,
  ) {
    const licencia = await this.licenciaRepository.findOne({
      where: { id },
    });

    if (!licencia) {
      throw new NotFoundException('Licencia no encontrada');
    }

    // =========================
    // Actualizar campos simples
    // =========================
    licencia.tipo = body.tipo;
    licencia.fechaInicio = body.fechaInicio;
    licencia.fechaFin = body.fechaFin;
    licencia.observaciones = body.observaciones;

    licencia.user = body.userId;

    // =========================
    // Si viene archivo nuevo
    // =========================
    if (archivo) {
      licencia.nombre = archivo.originalname;
      licencia.tipoMime = archivo.mimetype;
      licencia.tamano = archivo.size;
      licencia.archivo = archivo.buffer;
    }

    const updated = await this.licenciaRepository.save(licencia);

    // Recargar la entidad con relaciones para acceder a user y tipo
    const updatedWithRelations = await this.licenciaRepository.findOne({
      where: { id: updated.id },
      relations: ['user', 'tipo'],
    });

    // Registrar novedad al editar licencia
    const novedadRepo = this.dataSource.getRepository(Novedad);
    const novedad = novedadRepo.create({
      accion: 'EDICION DE LICENCIA',
      miLicencia: updated,
      usuario: updatedWithRelations?.user?.apellido + ' ' + updatedWithRelations?.user?.nombre,
      tipoLicencia: updatedWithRelations?.tipo?.nombre,
      observaciones: updatedWithRelations?.observaciones,
    });
    console.log('✓ Novedad editada:', { usuario: novedad.usuario, tipoLicencia: novedad.tipoLicencia });
    await novedadRepo.save(novedad);

    return updated;
  }

}

