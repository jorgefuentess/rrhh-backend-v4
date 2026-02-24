import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class ReciboSueldo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  docente: User;

  @Column('int')
  anio: number;

  @Column('int')
  mes: number;

  @Column({ type: 'text' })
  archivoNombre: string;

  @Column({ type: 'text' })
  archivoRuta: string;

  @Column({ type: 'text', nullable: true })
  conformidad?: string; // 'conforme' | 'no_conforme' | null

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaConformidad?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCarga: Date;
}
