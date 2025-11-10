import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser } from './auth_users.entity';

@Injectable()
export class AuthUsersService {
  constructor(@InjectRepository(AuthUser) private repo: Repository<AuthUser>) {}

  async onModuleInit() {
    const admin = await this.repo.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const hash = await bcrypt.hash('admin123', 10);
      const user = this.repo.create({ username: 'admin', password: hash, role: 'admin' });
      await this.repo.save(user);
      console.log('🟢 Usuario admin creado (admin / admin123)');
    }
  }

  findAll() { return this.repo.find(); }
  findByUsername(username: string) { return this.repo.findOne({ where: { username } }); }
  async create(data: any) { const hash = await bcrypt.hash(data.password, 10); return this.repo.save({ ...data, password: hash }); }
  async update(id: number, data: any) {
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.repo.update(id, data); return this.repo.findOne({ where: { id } });
  }
  remove(id: number) { return this.repo.delete(id); }
}