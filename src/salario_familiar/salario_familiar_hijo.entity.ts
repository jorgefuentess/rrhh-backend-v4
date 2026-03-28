import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SalarioFamiliar } from './salario_familiar.entity';

export enum SalarioFamiliarNivelEscolar {
  SIN_ESCOLARIDAD = 'SIN_ESCOLARIDAD',
  INICIAL = 'INICIAL',
  PRIMARIO = 'PRIMARIO',
  SECUNDARIO = 'SECUNDARIO',
  UNIVERSITARIO = 'UNIVERSITARIO',
}

export enum SalarioFamiliarMotivoBaja {
  FALLECIMIENTO = 'FALLECIMIENTO',
  DIVORCIO = 'DIVORCIO',
  SOLICITUD_DEL_AGENTE = 'SOLICITUD_DEL_AGENTE',
  SIN_PRESENTACION_DE_DOCUMENTACION = 'SIN_PRESENTACION_DE_DOCUMENTACION',
  LIMITE_DE_EDAD = 'LIMITE_DE_EDAD',
}

@Entity()
export class SalarioFamiliarHijo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalarioFamiliar, (salarioFamiliar) => salarioFamiliar.hijos, {
    onDelete: 'CASCADE',
  })
  salarioFamiliar: SalarioFamiliar;

  @Column({ type: 'varchar', length: 120 })
  apellido: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  dni: string;

  @Column({ type: 'varchar', length: 20 })
  cuil: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'enum', enum: SalarioFamiliarNivelEscolar })
  nivelEscolar: SalarioFamiliarNivelEscolar;

  @Column({ type: 'boolean', default: false })
  discapacidad: boolean;

  @Column({ type: 'boolean', default: true })
  pagoSalario: boolean;

  @Column({ type: 'text', nullable: true })
  motivoNoPago?: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'date', nullable: true })
  fechaBaja?: string | null;

  @Column({ type: 'enum', enum: SalarioFamiliarMotivoBaja, nullable: true })
  motivoBaja?: SalarioFamiliarMotivoBaja | null;

  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @Column({ type: 'date', nullable: true, default: null })
  fechaModificacion: string | null;
}