import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SalarioFamiliar } from './salario_familiar.entity';

export enum SalarioFamiliarTipoAsignacion {
  MATRIMONIO = 'MATRIMONIO',
  PRENATAL = 'PRENATAL',
  NACIMIENTO_PRIMER_O_SEGUNDO_HIJO = 'NACIMIENTO_PRIMER_O_SEGUNDO_HIJO',
  NACIMIENTO_TERCER_HIJO_O_MAS = 'NACIMIENTO_TERCER_HIJO_O_MAS',
  ADOPCION = 'ADOPCION',
}

@Entity()
export class SalarioFamiliarPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalarioFamiliar, (salarioFamiliar) => salarioFamiliar.pagos, {
    onDelete: 'CASCADE',
  })
  salarioFamiliar: SalarioFamiliar;

  @Column({ type: 'enum', enum: SalarioFamiliarTipoAsignacion })
  tipoAsignacion: SalarioFamiliarTipoAsignacion;

  @Column({ type: 'date' })
  fechaSolicitud: string;

  @Column({ type: 'date' })
  periodoLiquidacion: string;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @Column({ type: 'date', nullable: true, default: null })
  fechaModificacion: string | null;
}