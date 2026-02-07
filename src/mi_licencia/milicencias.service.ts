import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiLicencia } from './milicencia.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MiLicenciasService {
  constructor(
    @InjectRepository(MiLicencia)
    private readonly licenciaRepository: Repository<MiLicencia>,
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

      // 📂 archivo
      nombre: archivo.originalname,
      tipoMime: archivo.mimetype,
      tamano: archivo.size,
      archivo: archivo.buffer,

      user: body.userId,
    });

    return this.licenciaRepository.save(licencia);
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


}

