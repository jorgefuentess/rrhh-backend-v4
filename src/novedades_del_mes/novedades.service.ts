import { Injectable } from '@nestjs/common';
import { Novedad } from './novedad.entity';
import { Licencia } from 'src/licencias/licencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class NovedadesService {
  constructor(
    @InjectRepository(Novedad)
    private readonly repo: Repository<Novedad>,
  ) { }

  async createNovedades(licencia: Licencia, accion: string) {
    const novedad = this.repo.create({
      licencia: { id: licencia.id }, // 👈 clave
      accion:"nuevo1",
    });

    return this.repo.save(novedad);
  }

}