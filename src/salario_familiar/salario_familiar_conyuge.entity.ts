import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SalarioFamiliar } from './salario_familiar.entity';
import { SalarioFamiliarMotivoBaja } from './salario_familiar_hijo.entity';

@Entity()
export class SalarioFamiliarConyuge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalarioFamiliar, (salarioFamiliar) => salarioFamiliar.conyuges, {
    onDelete: 'CASCADE',
  })
  salarioFamiliar: SalarioFamiliar;

  @Column({ type: 'varchar', length: 120 })
  apellido: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  dni: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  telefono?: string | null;

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