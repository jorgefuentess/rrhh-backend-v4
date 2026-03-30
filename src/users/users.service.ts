import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto } from './DTO/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // === Obtener todos los usuarios ===
  async findAll(schoolId?: string): Promise<User[]> {
    if (!schoolId) {
      return this.repo.find()
    }

    return this.repo.find({ where: { schoolId } })
  }

  // === Obtener un usuario por ID ===
  async findOne(id: string, schoolId?: string): Promise<User | null> {
    if (schoolId) {
      return this.repo.findOne({ where: { id, schoolId } })
    }

    return this.repo.findOne({ where: { id } })
  }

  // === Crear un nuevo usuario ===
  async create(dataDTO: CreateUserDto, schoolId?: string): Promise<User> {
    const user = this.repo.create({ ...dataDTO, schoolId })
    return await this.repo.save(user)
  }

  // === Actualizar un usuario existente ===
  async update(id: string, data: Partial<User>, schoolId?: string): Promise<User | null> {
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