import {
  BadRequestException,
  Injectable,
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


    const licencia = this.licenciaRepository.create({
      tipo: body.tipo,
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaFin,
      cantidadDias: Number(body.cantidadDias),
      observaciones: body.observaciones,

      // 📂 archivo
      nombre: archivo.originalname,
      tipoMime: archivo.mimetype,
      tamano: archivo.size,
      archivo: archivo.buffer,

      user:body.userId,
    });

    return this.licenciaRepository.save(licencia);
  }

}
