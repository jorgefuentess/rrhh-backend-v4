import { Licencia } from 'src/licencias/licencia.entity';
import { Servicio } from 'src/servicios/servicio.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,

  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';


@Entity()
export class Novedad {

  @PrimaryGeneratedColumn('uuid')
  id: string;

@ManyToOne(() => Licencia, { nullable: true, onDelete: 'CASCADE', eager: true })
@JoinColumn({ name: 'licencia_id' })
licencia?: Licencia;

@ManyToOne(() => Servicio, { nullable: true, onDelete: 'CASCADE', eager: true })
@JoinColumn({ name: 'servicio_id' })
servicio?: Servicio;


  @Column()
  accion: string;

  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @Column({ type: 'date', nullable: true })
  fechaModificacion?: string;


}
