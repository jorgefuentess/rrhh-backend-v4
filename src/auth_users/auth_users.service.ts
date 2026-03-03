import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser } from './auth_users.entity';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/user.entity';
import { LinkUserToPersonaDto } from './dto/link-user-to-persona.dto';

@Injectable()
export class AuthUsersService {
  constructor(
    @InjectRepository(AuthUser) private repo: Repository<AuthUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const admin = await this.repo.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const hash = await bcrypt.hash('admin123', 10);
      const user = this.repo.create({ username: 'admin', password: hash, roles: [Role.Admin] });
      await this.repo.save(user);
      console.log('🟢 Usuario admin creado (admin / admin123)');
    }
  }

  findAll() { return this.repo.find(); }
  findByUsername(username: string) { return this.repo.findOne({ where: { username } }); }

  async create(data: any) {
    // Normalizar roles: puede venir como string único o array
    let roles: string[];
    if (Array.isArray(data.roles)) {
      roles = data.roles;
    } else if (data.role) {
      roles = [data.role];
    } else {
      roles = [Role.Docente];
    }
    
    // Si envía personaId, validar que existe
    if (data.personaId) {
      const persona = await this.userRepo.findOne({ where: { id: data.personaId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId');
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    return this.repo.save({ ...data, roles, password: hash });
  }

  async update(id: number, data: any) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;

    // Normalizar roles
    let roles: string[] | undefined;
    if (Array.isArray(data.roles)) {
      roles = data.roles;
    } else if (data.role) {
      roles = [data.role];
    } else {
      roles = existing.roles;
    }

    const personaId = data.personaId ?? existing.personaId;

    // Si envía personaId, validar que existe
    if (data.personaId) {
      const persona = await this.userRepo.findOne({ where: { id: data.personaId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId');
      }
    }

    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.repo.update(id, { ...data, roles, personaId });
    return this.repo.findOne({ where: { id } });
  }
  remove(id: number) { return this.repo.delete(id); }

  /**
   * Vincula una Persona existente con un nuevo AuthUser
   * Flujo: Admin selecciona persona creada por secretario y crea usuario de sistema
   * @param data LinkUserToPersonaDto con username, password, role, personaId
   */
  async linkUserToPersona(data: LinkUserToPersonaDto) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Validar que la persona existe
      const persona = await manager.findOne(User, { where: { id: data.personaId } });
      if (!persona) {
        throw new BadRequestException(`Persona con ID ${data.personaId} no encontrada`);
      }

      // 2. Validar que no existe otro usuario vinculado a esta persona
      const existingAuthUser = await manager.findOne(AuthUser, {
        where: { personaId: data.personaId },
      });
      if (existingAuthUser) {
        throw new BadRequestException(
          `La persona ${persona.apellido}, ${persona.nombre} ya tiene un usuario de sistema asociado (${existingAuthUser.username})`,
        );
      }

      // 3. Crear auth user vinculado
      const hash = await bcrypt.hash(data.password, 10);
      const roles = Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : [Role.Docente]);
      const authUser = manager.create(AuthUser, {
        username: data.username,
        password: hash,
        roles,
        personaId: data.personaId,
        activo: true,
      });
      const savedAuthUser = await manager.save(authUser);

      // 4. Retornar con relación cargada
      return await manager.findOne(AuthUser, {
        where: { id: savedAuthUser.id },
        relations: ['persona'],
      });
    });
  }
}