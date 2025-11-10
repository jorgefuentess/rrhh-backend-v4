import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './servicio.entity';
import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Nivel)
    private readonly nivelRepo: Repository<Nivel>,

    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,

    @InjectRepository(Materia)
    private readonly materiaRepo: Repository<Materia>,
  ) {}

  async findAll() {
    return this.repo.find({
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
}