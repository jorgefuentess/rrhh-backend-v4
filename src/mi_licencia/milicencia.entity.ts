import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../users/user.entity';
import { TipoLicencia } from 'src/tipo_licencia/tipo_licencia.entity';

@Entity()
export class MiLicencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn()
  user: User;

  @CreateDateColumn({
    type: 'date',
    nullable: true,
  })

  fechaSistema: string;

  @UpdateDateColumn({
    type: 'date',
    nullable: true,
  })
  fechaModificacion: string;

  // @Column({ length: 50 })
  // tipo: string;
  
  @ManyToOne(() => TipoLicencia, { eager: true, nullable: false  })
  @JoinColumn()
  tipo: TipoLicencia;

  @Column({ type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 50 })
  tipoMime: string;

  @Column({ type: 'int' })
  tamano: number;

  @Exclude()
  @Column({ type: 'bytea' })
  archivo: Buffer;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

}