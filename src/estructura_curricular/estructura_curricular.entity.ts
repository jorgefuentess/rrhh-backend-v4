import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('estructura_curricular')
@Index(['nivel', 'turno', 'seccion', 'materia', 'schoolId'], { unique: true })
export class EstructuraCurricular {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  nivel: string;

  @Column({ type: 'varchar', length: 40 })
  turno: string;

  @Column({ type: 'varchar', length: 80 })
  seccion: string;

  @Column({ type: 'varchar', length: 120 })
  materia: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  horas: number;

  @Column({ type: 'varchar', length: 60 })
  tipoMateria: string;

  @Column({ type: 'varchar', length: 60 })
  condicion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  schoolId?: string;
}
