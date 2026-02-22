import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';

@Entity()
export class AuthUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: Role.Docente })
  role: string;

  @Column({ default: true })
  activo: boolean;

  // ✨ NUEVO: Relación con Persona (User)
  @Column({ type: 'uuid', nullable: true })
  personaId: string;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'personaId' })
  persona: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}