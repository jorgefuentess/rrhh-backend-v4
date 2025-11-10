import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nivel } from './nivel.entity';
import { Seccion } from './seccion.entity';
import { Materia } from './materia.entity';
import { CreateNivelDto } from './dto/create-nivel.dto';

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(Nivel) private nivelRepo: Repository<Nivel>,
    @InjectRepository(Seccion) private seccionRepo: Repository<Seccion>,
    @InjectRepository(Materia) private materiaRepo: Repository<Materia>,
  ) {}

  // ------- Nivel -------
  async createNivel(data: CreateNivelDto) {
    const nivel = this.nivelRepo.create({ nombre: data.nombre });
    console.log('🧱 Creando nivel:', nivel);
    return this.nivelRepo.save(nivel);
  }
  findNivel() {
    return this.nivelRepo.find();
  }

  // ------- Sección -----
  createSeccion(nombre: string, nivelId: number) {
    const seccion = this.seccionRepo.create({
      nombre,
      nivel: { id: nivelId } as any,
    });
    return this.seccionRepo.save(seccion);
  }
  findSeccion() {
    return this.seccionRepo.find({ relations: ['nivel'] });
  }

  // ------- Materia -----
  createMateria(nombre: string, seccionId: number) {
    const materia = this.materiaRepo.create({
      nombre,
      seccion: { id: seccionId } as any,
    });
    return this.materiaRepo.save(materia);
  }

  findMateria() {
    return this.materiaRepo.find({ relations: ['seccion'] });
  }
}
