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
  async findAll(schoolId?: string): Promise<NoDocente[]> {
    if (!schoolId) {
      return this.repo.find()
    }

    return this.repo.find({ where: { schoolId } })
  }

  // === Obtener un usuario por ID ===
  async findOne(id: string, schoolId?: string): Promise<NoDocente | null> {
    if (schoolId) {
      return this.repo.findOne({ where: { id, schoolId } })
    }

    return this.repo.findOne({ where: { id } })
  }

  // === Crear un nuevo usuario ===
  async create(dataDTO: NoDocente, schoolId?: string): Promise<NoDocente> {
    const user = this.repo.create({ ...dataDTO, schoolId })
    return await this.repo.save(user)
  }

  // === Actualizar un usuario existente ===
  async update(id: string, data: Partial<NoDocente>, schoolId?: string): Promise<NoDocente | null> {
    const user = schoolId
      ? await this.repo.findOne({ where: { id, schoolId } })
      : await this.repo.findOne({ where: { id } })

    if (!user) return null

    Object.assign(user, data)
    return await this.repo.save(user)
  }

  remove(id: string, schoolId?: string) {
    if (schoolId) {
      return this.repo.delete({ id, schoolId })
    }

    return this.repo.delete(id)
  }
}