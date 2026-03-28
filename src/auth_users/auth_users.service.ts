import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser, PersonaTipoAuth } from './auth_users.entity';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/user.entity';
import { LinkUserToPersonaDto } from './dto/link-user-to-persona.dto';
import { NoDocente } from '../no_docente/no_docente.entity';

@Injectable()
export class AuthUsersService {
  constructor(
    @InjectRepository(AuthUser) private repo: Repository<AuthUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(NoDocente) private noDocenteRepo: Repository<NoDocente>,
    private dataSource: DataSource,
  ) {}

  private resolvePersonaTipo(
    rawPersonaTipo: unknown,
    roles: string[],
    fallback?: PersonaTipoAuth,
  ): PersonaTipoAuth {
    if (rawPersonaTipo === PersonaTipoAuth.DOCENTE || rawPersonaTipo === PersonaTipoAuth.NO_DOCENTE) {
      return rawPersonaTipo;
    }

    if (fallback === PersonaTipoAuth.DOCENTE || fallback === PersonaTipoAuth.NO_DOCENTE) {
      return fallback;
    }

    return roles.includes(Role.NoDocente) && !roles.includes(Role.Docente)
      ? PersonaTipoAuth.NO_DOCENTE
      : PersonaTipoAuth.DOCENTE;
  }

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
    
    const personaTipo = this.resolvePersonaTipo(data.personaTipo, roles);

    // Si envía personaId, validar que existe en la tabla correspondiente
    if (data.personaId) {
      const persona =
        personaTipo === PersonaTipoAuth.NO_DOCENTE
          ? await this.noDocenteRepo.findOne({ where: { id: data.personaId } })
          : await this.userRepo.findOne({ where: { id: data.personaId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId y personaTipo');
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    return this.repo.save({ ...data, roles, personaTipo, password: hash });
  }

  async update(id: number, data: any) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;

    // Normalizar roles
    const roles: string[] = Array.isArray(data.roles)
      ? data.roles
      : data.role
      ? [data.role]
      : existing.roles;

    const personaId = data.personaId ?? existing.personaId;
    const personaTipo = this.resolvePersonaTipo(data.personaTipo, roles, existing.personaTipo);

    // Si envía personaId/personaTipo, validar que existe
    if (personaId) {
      const persona =
        personaTipo === PersonaTipoAuth.NO_DOCENTE
          ? await this.noDocenteRepo.findOne({ where: { id: personaId } })
          : await this.userRepo.findOne({ where: { id: personaId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId y personaTipo');
      }
    }

    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.repo.update(id, { ...data, roles, personaId, personaTipo });
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
      const roles = Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : [Role.Docente]);
      const personaTipo = this.resolvePersonaTipo(data.personaTipo, roles);

      // 1. Validar que la persona existe
      const persona =
        personaTipo === PersonaTipoAuth.NO_DOCENTE
          ? await manager.findOne(NoDocente, { where: { id: data.personaId } })
          : await manager.findOne(User, { where: { id: data.personaId } });
      if (!persona) {
        throw new BadRequestException(`Persona con ID ${data.personaId} no encontrada`);
      }

      // 2. Validar que no existe otro usuario vinculado a esta persona
      const existingAuthUser = await manager.findOne(AuthUser, {
        where: { personaId: data.personaId, personaTipo },
      });
      if (existingAuthUser) {
        throw new BadRequestException(
          `La persona ${persona.apellido}, ${persona.nombre} ya tiene un usuario de sistema asociado (${existingAuthUser.username})`,
        );
      }

      // 3. Crear auth user vinculado
      const hash = await bcrypt.hash(data.password, 10);
      const authUser = manager.create(AuthUser, {
        username: data.username,
        password: hash,
        roles,
        personaId: data.personaId,
        personaTipo,
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