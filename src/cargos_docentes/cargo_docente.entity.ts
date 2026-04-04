import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('cargos_docentes')
@Index(['nivel', 'codigo', 'schoolId'], { unique: true })
export class CargoDocente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  nivel: string;

  @Column({ type: 'varchar', length: 180 })
  cargo: string;

  @Column({ type: 'int' })
  codigo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  puntos: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  horas: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  schoolId?: string;
}
