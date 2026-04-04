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
import { SalarioFamiliarConyuge } from './salario_familiar_conyuge.entity';
import { SalarioFamiliarHijo } from './salario_familiar_hijo.entity';
import { SalarioFamiliarPago } from './salario_familiar_pago.entity';

export enum SalarioFamiliarPersonaTipo {
  DOCENTE = 'DOCENTE',
  NO_DOCENTE = 'NO_DOCENTE',
}

export enum SalarioFamiliarEstadoCivil {
  SOLTERO_A = 'SOLTERO_A',
  CASADO_A = 'CASADO_A',
  VIUDO_A = 'VIUDO_A',
  DIVORCIADO_A = 'DIVORCIADO_A',
}

@Entity()
export class SalarioFamiliar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SalarioFamiliarPersonaTipo })
  personaTipo: SalarioFamiliarPersonaTipo;

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  docente?: User | null;

  @ManyToOne(() => NoDocente, { nullable: true, eager: true, onDelete: 'SET NULL' })
  noDocente?: NoDocente | null;

  @Column({ type: 'enum', enum: SalarioFamiliarEstadoCivil })
  estadoCivil: SalarioFamiliarEstadoCivil;

  @Column({ type: 'text', nullable: true })
  observacion?: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => SalarioFamiliarConyuge, (conyuge) => conyuge.salarioFamiliar)
  conyuges: SalarioFamiliarConyuge[];

  @OneToMany(() => SalarioFamiliarHijo, (hijo) => hijo.salarioFamiliar)
  hijos: SalarioFamiliarHijo[];

  @OneToMany(() => SalarioFamiliarPago, (pago) => pago.salarioFamiliar)
  pagos: SalarioFamiliarPago[];

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