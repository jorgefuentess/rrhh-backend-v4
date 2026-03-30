import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser, PersonaTipoAuth } from './auth_users.entity';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/user.entity';
import { LinkUserToPersonaDto } from './dto/link-user-to-persona.dto';
import { NoDocente } from '../no_docente/no_docente.entity';
import { School } from '../schools/school.entity';

const DEFAULT_SCHOOL_SLUG = 'escuela-base';
const DEFAULT_SCHOOL_NAME = 'Escuela Base';

@Injectable()
export class AuthUsersService {
  constructor(
    @InjectRepository(AuthUser) private repo: Repository<AuthUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(NoDocente) private noDocenteRepo: Repository<NoDocente>,
    @InjectRepository(School) private schoolRepo: Repository<School>,
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
    const defaultSchool = await this.ensureDefaultSchool();
    await this.backfillSchoolIds(defaultSchool.id);

    const admin = await this.repo.findOne({ where: { username: 'admin' } });
    if (!admin) {
      const hash = await bcrypt.hash('admin123', 10);
      const user = this.repo.create({
        username: 'admin',
        password: hash,
        roles: [Role.Admin],
        schoolId: defaultSchool.id,
      });
      await this.repo.save(user);
      console.log('🟢 Usuario admin creado (admin / admin123)');
      return;
    }

    if (!admin.schoolId) {
      await this.repo.update(admin.id, { schoolId: defaultSchool.id });
    }
  }

  private async ensureDefaultSchool(): Promise<School> {
    const existing = await this.schoolRepo.findOne({ where: { slug: DEFAULT_SCHOOL_SLUG } });
    if (existing) return existing;

    const school = this.schoolRepo.create({
      slug: DEFAULT_SCHOOL_SLUG,
      name: DEFAULT_SCHOOL_NAME,
      active: true,
    });

    return this.schoolRepo.save(school);
  }

  private async backfillSchoolIds(defaultSchoolId: string): Promise<void> {
    await this.repo.update({ schoolId: IsNull() }, { schoolId: defaultSchoolId });
    await this.userRepo.update({ schoolId: IsNull() }, { schoolId: defaultSchoolId });
    await this.noDocenteRepo.update({ schoolId: IsNull() }, { schoolId: defaultSchoolId });
  }

  private async resolveSchoolId(schoolId?: string): Promise<string> {
    if (schoolId) return schoolId;

    const defaultSchool = await this.ensureDefaultSchool();
    return defaultSchool.id;
  }

  async findAll(schoolId?: string) {
    const scopedSchoolId = await this.resolveSchoolId(schoolId);
    return this.repo.find({ where: { schoolId: scopedSchoolId } });
  }

  findByUsername(username: string) { return this.repo.findOne({ where: { username } }); }

  async create(data: any, schoolId?: string) {
    const scopedSchoolId = await this.resolveSchoolId(schoolId);

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
          ? await this.noDocenteRepo.findOne({ where: { id: data.personaId, schoolId: scopedSchoolId } })
          : await this.userRepo.findOne({ where: { id: data.personaId, schoolId: scopedSchoolId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId y personaTipo');
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    return this.repo.save({ ...data, roles, personaTipo, schoolId: scopedSchoolId, password: hash });
  }

  async update(id: number, data: any, schoolId?: string) {
    const scopedSchoolId = await this.resolveSchoolId(schoolId);

    const existing = await this.repo.findOne({ where: { id, schoolId: scopedSchoolId } });
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
          ? await this.noDocenteRepo.findOne({ where: { id: personaId, schoolId: scopedSchoolId } })
          : await this.userRepo.findOne({ where: { id: personaId, schoolId: scopedSchoolId } });
      if (!persona) {
        throw new BadRequestException('Persona no encontrada para personaId y personaTipo');
      }
    }

    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.repo.update(id, { ...data, roles, personaId, personaTipo, schoolId: scopedSchoolId });
    return this.repo.findOne({ where: { id, schoolId: scopedSchoolId } });
  }

  async remove(id: number, schoolId?: string) {
    const scopedSchoolId = await this.resolveSchoolId(schoolId);
    return this.repo.delete({ id, schoolId: scopedSchoolId });
  }

  /**
   * Vincula una Persona existente con un nuevo AuthUser
   * Flujo: Admin selecciona persona creada por secretario y crea usuario de sistema
   * @param data LinkUserToPersonaDto con username, password, role, personaId
   */
  async linkUserToPersona(data: LinkUserToPersonaDto, schoolId?: string) {
    const scopedSchoolId = await this.resolveSchoolId(schoolId);

    return await this.dataSource.transaction(async (manager) => {
      const roles = Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : [Role.Docente]);
      const personaTipo = this.resolvePersonaTipo(data.personaTipo, roles);

      // 1. Validar que la persona existe
      const persona =
        personaTipo === PersonaTipoAuth.NO_DOCENTE
          ? await manager.findOne(NoDocente, { where: { id: data.personaId, schoolId: scopedSchoolId } })
          : await manager.findOne(User, { where: { id: data.personaId, schoolId: scopedSchoolId } });
      if (!persona) {
        throw new BadRequestException(`Persona con ID ${data.personaId} no encontrada`);
      }

      // 2. Validar que no existe otro usuario vinculado a esta persona
      const existingAuthUser = await manager.findOne(AuthUser, {
        where: { personaId: data.personaId, personaTipo, schoolId: scopedSchoolId },
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
        schoolId: scopedSchoolId,
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