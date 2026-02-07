import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';

@Entity()
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigoCargo: string;

  @Column()
  cargo: string;

  @Column('int')
  puntos: number;

  @Column('int')
  cantHs: number;

  @Column()
  caracter: string;

  @Column({ type: 'date' })
  fechaToma: string;

  // 🔹 Relaciones
  @ManyToOne(() => User, (user) => user.servicios, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Nivel, { nullable: true, eager: true, onDelete: 'SET NULL' })
  nivel?: Nivel | null;

  @ManyToOne(() => Seccion, { nullable: true, eager: true, onDelete: 'SET NULL' })
  seccion?: Seccion | null;

  @ManyToOne(() => Materia, { nullable: true, eager: true, onDelete: 'SET NULL' })
  materia?: Materia | null;



  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @Column({
    type: 'date',
    nullable: true,
    default: null,
  })
  fechaModificacion: string | null;
}