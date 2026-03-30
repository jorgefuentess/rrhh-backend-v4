import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';

export enum PersonaTipoAuth {
  DOCENTE = 'DOCENTE',
  NO_DOCENTE = 'NO_DOCENTE',
}

@Entity()
export class AuthUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('simple-array', { default: Role.Docente })
  roles: string[];

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'uuid', nullable: true })
  schoolId: string;

  // ✨ NUEVO: Relación con Persona (User)
  @Column({ type: 'uuid', nullable: true })
  personaId: string;

  @Column({
    type: 'enum',
    enum: PersonaTipoAuth,
    default: PersonaTipoAuth.DOCENTE,
  })
  personaTipo: PersonaTipoAuth;

  @ManyToOne(() => User, { lazy: true, nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'personaId' })
  persona: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}