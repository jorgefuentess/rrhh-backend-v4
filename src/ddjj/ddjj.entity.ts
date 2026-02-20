import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Escuela } from 'src/escuela/escuela.entity';

@Entity('ddjj')
export class DDJJ {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Fecha de carga (automática)' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  fechaCarga: Date;

  @ApiProperty({ description: 'Horas/cargos en el COLEGIO (autocalculado desde servicios)' })
  @Column({ type: 'int', default: 0 })
  cargosHsColegio: number;

  @ApiProperty({ description: 'Horas/cargos en establecimientos PRIVADOS', required: false })
  @Column({ type: 'int', default: 0 })
  cargosHsPrivados: number;

  @ApiProperty({ description: 'Horas/cargos en establecimientos PÚBLICOS', required: false })
  @Column({ type: 'int', default: 0 })
  cargosHsPublicos: number;

  @ApiProperty({ description: 'Horas/cargos en establecimientos', required: false })
  @Column({ type: 'int', default: 0 })
  horas: number;

  @ManyToOne(() => User, (u) => u.ddjjs, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 👇 UN DDJJ tiene MUCHAS escuelas
  @OneToMany(() => Escuela, (escuela) => escuela.ddj, {
    cascade: true, // opcional si querés que se guarden juntas
  })
  escuelas: Escuela[];
  
}