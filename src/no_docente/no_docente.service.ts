import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NoDocente } from './no_docente.entity'


@Injectable()
export class NoDocenteService {
  constructor(
    @InjectRepository(NoDocente)
    private readonly repo: Repository<NoDocente>,
  ) {}

  // === Obtener todos los usuarios ===
  async findAll(): Promise<NoDocente[]> {
    return this.repo.find()
  }

  // === Obtener un usuario por ID ===
  async findOne(id: string): Promise<NoDocente | null> {
    return this.repo.findOne({ where: { id } })
  }

  // === Crear un nuevo usuario ===
  async create(dataDTO: NoDocente): Promise<NoDocente> {
    const user = this.repo.create(dataDTO)
    return await this.repo.save(user)
  }

  // === Actualizar un usuario existente ===
  async update(id: string, data: Partial<NoDocente>): Promise<NoDocente | null> {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) return null

    Object.assign(user, data)
    return await this.repo.save(user)
  }
   remove(id: string) { return this.repo.delete(id); }
}