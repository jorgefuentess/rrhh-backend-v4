import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Retencion } from 'src/retenciones/retencion.entity';

@Entity()
export class RetencionBoleta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Retencion, (retencion) => retencion.boletas, {
    onDelete: 'CASCADE',
  })
  retencion: Retencion;

  @Column({ type: 'varchar', length: 60 })
  numeroBoleta: string;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
