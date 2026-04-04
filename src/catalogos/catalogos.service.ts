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
  async createNivel(data: CreateNivelDto, schoolId?: string) {
    const nivel = this.nivelRepo.create({ nombre: data.nombre, schoolId });
    return this.nivelRepo.save(nivel);
  }
  findNivel(schoolId?: string) {
    return this.nivelRepo.find(schoolId ? { where: { schoolId } } : {});
  }

  // ------- Sección -----
  createSeccion(nombre: string, nivelId: number, schoolId?: string) {
    const seccion = this.seccionRepo.create({
      nombre,
      nivel: { id: nivelId } as any,
      schoolId,
    });
    return this.seccionRepo.save(seccion);
  }
  findSeccion(schoolId?: string) {
    return this.seccionRepo.find({ where: schoolId ? { schoolId } : {}, relations: ['nivel'] });
  }

  // ------- Materia -----
  createMateria(nombre: string, seccionId: number, schoolId?: string) {
    const materia = this.materiaRepo.create({
      nombre,
      seccion: { id: seccionId } as any,
      schoolId,
    });
    return this.materiaRepo.save(materia);
  }

  findMateria(schoolId?: string) {
    return this.materiaRepo.find({ where: schoolId ? { schoolId } : {}, relations: ['seccion'] });
  }
}
