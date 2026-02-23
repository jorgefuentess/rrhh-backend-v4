import { Licencia } from 'src/licencias/licencia.entity';
import { MiLicencia } from 'src/mi_licencia/milicencia.entity';
import { Servicio } from 'src/servicios/servicio.entity';
import { ServicioNoDocente } from 'src/servicio_no_docente/servicionodocente.entity';
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

  @ManyToOne(() => MiLicencia, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'mi_licencia_id' })
  miLicencia?: MiLicencia;

  @ManyToOne(() => Servicio, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'servicio_id' })
  servicio?: Servicio;

  @ManyToOne(() => ServicioNoDocente, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'servicio_no_docente_id' })
  servicioNoDocente?: ServicioNoDocente;


  @Column()
  accion: string;

  @Column({ type: 'text', nullable: true })
  usuario?: string;

  @Column({ type: 'text', nullable: true })
  tipoLicencia?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'json', nullable: true })
  cambios?: any;

  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @Column({ type: 'date', nullable: true })
  fechaModificacion?: string;


}
