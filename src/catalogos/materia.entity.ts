import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Seccion } from './seccion.entity';

@Entity()
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Seccion, (seccion) => seccion.materias, { onDelete: 'CASCADE' })
  seccion: Seccion;
}
