import { Licencia } from 'src/licencias/licencia.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,

  OneToOne,
  JoinColumn,
} from 'typeorm';


@Entity()
export class Novedad {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 dueña de la relación (tiene la FK)
  @OneToOne(() => Licencia, (licencia) => licencia.novedad, {
    onDelete: 'CASCADE',
     eager: true, 
  })
  @JoinColumn({ name: 'licencia_id' })
  licencia: Licencia;

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
