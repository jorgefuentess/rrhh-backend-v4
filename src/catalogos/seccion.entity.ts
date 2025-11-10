import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Nivel } from './nivel.entity';
import { Materia } from './materia.entity';

@Entity()
export class Seccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Nivel, (nivel) => nivel.secciones, { onDelete: 'CASCADE' })
  nivel: Nivel;

  @OneToMany(() => Materia, (materia) => materia.seccion)
  materias: Materia[];
}

