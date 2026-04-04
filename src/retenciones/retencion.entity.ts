import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { RetencionBoleta } from './retencion-boleta.entity';

export enum RetencionTipo {
  PENSION_ALIMENTICIA = 'PENSION_ALIMENTICIA',
  EMBARGO = 'EMBARGO',
}

export enum RetencionPersonaTipo {
  DOCENTE = 'DOCENTE',
  NO_DOCENTE = 'NO_DOCENTE',
}

@Entity()
export class Retencion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RetencionTipo })
  tipoRetencion: RetencionTipo;

  @Column({ type: 'enum', enum: RetencionPersonaTipo })
  personaTipo: RetencionPersonaTipo;

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  docente?: User | null;

  @ManyToOne(() => NoDocente, { nullable: true, eager: true, onDelete: 'SET NULL' })
  noDocente?: NoDocente | null;

  @Column({ type: 'varchar', length: 120 })
  expedienteOficio: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  caratula?: string | null;

  // Pension alimenticia
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pensionPorcentaje?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pensionImporte?: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pensionCuentaJudicial?: string | null;

  // Embargo
  @Column({ type: 'varchar', length: 120, nullable: true })
  embargoCuentaJudicialCapital?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  embargoCuentaJudicialHonorarios?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  embargoMontoCapital?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  embargoMontoHonorarios?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  embargoMontoTotal?: number | null;

  // Comunes
  @Column({ type: 'date', nullable: true })
  inicioRetencion?: string | null;

  @Column({ type: 'date', nullable: true })
  finRetencion?: string | null;

  @Column({ type: 'int', nullable: true })
  cantidadCuotas?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  importeTotalCuota?: number | null;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'date', nullable: true })
  fechaBaja?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  bajaExpedienteOficio?: string | null;

  @Column({ type: 'text', nullable: true })
  motivoBaja?: string | null;

  @Column({ type: 'boolean', default: false })
  bajaAutomatica: boolean;

  @OneToMany(() => RetencionBoleta, (boleta) => boleta.retencion, {
    cascade: true,
    eager: true,
  })
  boletas: RetencionBoleta[];

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

  @Column({ type: 'uuid', nullable: true })
  schoolId?: string;
}
