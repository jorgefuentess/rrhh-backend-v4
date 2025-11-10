import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // === Obtener todos los usuarios ===
  async findAll(): Promise<User[]> {
    return this.repo.find()
  }

  // === Obtener un usuario por ID ===
  async findOne(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } })
  }

  // === Crear un nuevo usuario ===
  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data)
    return await this.repo.save(user)
  }

  // === Actualizar un usuario existente ===
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) return null

    Object.assign(user, data)
    return await this.repo.save(user)
  }
}