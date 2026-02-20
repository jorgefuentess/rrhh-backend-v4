import { BadRequestException, Injectable } from '@nestjs/common';
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
  async createNovedad(
    referenciaId: string,
    accion: string,
    tipo: string,
  ) {
    console.log('createNovedad params:', { referenciaId, accion, tipo });
    const data: any = { accion };

    if (tipo === 'LICENCIA' || tipo === 'licencia') {
      data.licencia = { id: referenciaId };
    } else if (tipo === 'SERVICIO' || tipo === 'servicio') {
      data.servicio = { id: referenciaId };
    } else {
      console.error('Tipo inválido para novedad:', tipo);
      throw new BadRequestException('Tipo inválido para novedad');
    }
    console.log('data a guardar en novedad:', data);
    const novedad = this.repo.create(data);
    return this.repo.save(novedad);
  }


}