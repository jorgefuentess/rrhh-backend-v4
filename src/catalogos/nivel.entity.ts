import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seccion } from './seccion.entity';

@Entity()
export class Nivel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'uuid', nullable: true })
  schoolId?: string;

  @OneToMany(() => Seccion, (seccion) => seccion.nivel)
  secciones: Seccion[];
}
