import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

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

  @ManyToOne(() => User, (u) => u.ddjjs, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}