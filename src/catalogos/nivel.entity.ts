import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seccion } from './seccion.entity';

@Entity()
export class Nivel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Seccion, (seccion) => seccion.nivel)
  secciones: Seccion[];
}
