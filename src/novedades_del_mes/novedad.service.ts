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
    const data: any = { accion };

    if (tipo === 'LICENCIA') {
      data.licencia = { id: referenciaId };
    } else if (tipo === 'SERVICIO') {
      data.servicio = { id: referenciaId };
    } else {
      throw new BadRequestException('Tipo inválido para novedad');
    }
console.log("data a enviar",data)
    const novedad = this.repo.create(data);

    return this.repo.save(novedad);
  }


}