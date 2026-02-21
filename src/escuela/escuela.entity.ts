import { DDJJ } from 'src/ddjj/ddjj.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('escuelas')
export class Escuela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;


  @Column({ length: 50, nullable: true })
  codigo?: string;

  @Column({ length: 150, nullable: true })
  direccion?: string;

  @Column({ length: 100, nullable: true })
  localidad?: string;

  @Column({ length: 100, nullable: true })
  provincia?: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @CreateDateColumn({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaSistema: string;

  @UpdateDateColumn({
    type: 'date',
    nullable: true,
  })
  fechaModificacion: string;

  // // 👇 MUCHAS escuelas pertenecen a UN DDJJ
  // @ManyToOne(() => DDJJ, (ddj) => ddj.escuelas, {
  //   nullable: false,        // 🔥 obligatorio
  //   onDelete: 'CASCADE',    // si borrás DDJJ se borran escuelas
  // })
  // @JoinColumn({ name: 'ddj_id' }) // 👈 nombre explícito
  // ddj: DDJJ;
}
