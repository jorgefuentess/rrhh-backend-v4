import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Licencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column() tipo: string;
  @Column({ type: 'date', nullable: true }) fechaInicio: string;
  @Column({ type: 'date', nullable: true }) fechaFin: string;
  @Column({ type: 'int', default: 0 }) cantidadDias: number;
}