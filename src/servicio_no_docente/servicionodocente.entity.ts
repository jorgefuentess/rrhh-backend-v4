import { NoDocente } from 'src/no_docente/no_docente.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne } from 'typeorm';


@Entity()
export class ServicioNoDocente {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // 🔹 Relaciones
  @ManyToOne(() => NoDocente, { eager: true, onDelete: 'CASCADE' })
  noDocente: NoDocente;

  @Column()
  codigoCargo: string;

  @Column()
  cargo: string;

  @Column('int')
  cantHs: number;

  @Column({ type: 'date' })
  fechaToma: string;

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

}