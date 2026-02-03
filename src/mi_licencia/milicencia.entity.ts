import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class MiLicencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn()
  user: User;

  @CreateDateColumn({
    type: 'date',
    nullable: true,
  })

  fechaSistema: string;

  @UpdateDateColumn({
    type: 'date',
    nullable: true,
  })
  fechaModificacion: string;

  @Column({ length: 50 })
  tipo: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string;

  @Column({ type: 'int', default: 0 })
  cantidadDias: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 50 })
  tipoMime: string;

  @Column({ type: 'int' })
  tamano: number;

  @Column({ type: 'bytea' })
  archivo: Buffer;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

}