import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne } from 'typeorm';


@Entity()
export class ServicioNoDocente {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // 🔹 Relaciones
  // @ManyToOne(() => User, (user) => user.servicios, { eager: true, onDelete: 'CASCADE' })
  // user: User;

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