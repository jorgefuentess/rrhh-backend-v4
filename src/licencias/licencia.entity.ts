import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Novedad } from 'src/novedades_del_mes/novedad.entity';

@Entity()
export class Licencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  tipo: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string;

  @Column({ nullable: true })
  observaciones: string;

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

  @OneToOne(() => Novedad, (novedad) => novedad.licencia)
  novedad: Novedad;
}
