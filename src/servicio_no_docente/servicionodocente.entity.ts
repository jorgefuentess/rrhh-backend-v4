import { NoDocente } from 'src/no_docente/no_docente.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne } from 'typeorm';


@Entity()
export class ServicioNoDocente {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // 🔹 Relaciones
  @ManyToOne(() => NoDocente, { eager: true, onDelete: 'CASCADE' })
  noDocente: NoDocente;

  @Column({ type: 'varchar', nullable: true })
  codigoCargo?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cargo?: string | null;

  @Column({ type: 'int', nullable: true })
  cantHs?: number | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  cantHsSemanales?: number;

  @Column({ nullable: true })
  agrupamiento?: string; // MAESTRANZA, ADMINISTRATIVO

  @Column({ nullable: true })
  categoria?: string; // 1°, 2°, 3°, 4°, 5°

  @Column({ nullable: true })
  condicion?: string; // TITULAR, REEMPLAZANTE

  @Column({ type: 'date', nullable: true })
  fechaToma?: string | null;

  @Column('int', { nullable: true })
  boleta?: number;

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

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'date', nullable: true })
  fechaBaja?: string;

  @Column({ type: 'text', nullable: true })
  motivoBaja?: string;

}