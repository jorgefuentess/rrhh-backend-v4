import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity('tipo_licencia')
export class TipoLicencia {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    nombre?: string;
    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    descripcion?: string;

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
}
