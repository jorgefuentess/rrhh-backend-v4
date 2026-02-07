import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServicioNoDocente } from './servicionodocente.entity';

@Injectable()
export class ServicioNoDocenteService {
  constructor(
    @InjectRepository(ServicioNoDocente)
    private readonly repo: Repository<ServicioNoDocente>
  ) { }

  async findAll() {
    return this.repo.find({
      order: { fechaToma: 'DESC' },
    });
  }

  async create(data: any) {
    if (!data.user?.id) {
      throw new BadRequestException('user.id es requerido');
    }

    const entidad = new ServicioNoDocente();

    // Atributos simples
    entidad.codigoCargo = data.codigoCargo;
    entidad.cargo = data.cargo;
    entidad.cantHs = data.cantHs;
    entidad.fechaToma = data.fechaToma;

    // 👇 CLAVE: al crear siempre NULL
    entidad.fechaModificacion = null;

    const saved = await this.repo.save(entidad);
    console.log('✅ Servicio creado correctamente:', saved);
    return saved;
  }

}