import { Injectable } from '@nestjs/common';
import { Novedad } from './novedad.entity';
import { Licencia } from 'src/licencias/licencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class NovedadService {
  constructor(
    @InjectRepository(Novedad)
    private readonly repo: Repository<Novedad>,
  ) { }
  findAll() { return this.repo.find(); }
  async createNovedad(licenciaId: string, accion: string) {

    const novedad = this.repo.create({
      accion,
      licencia: { id: licenciaId },
    });

    return this.repo.save(novedad);
  }


}