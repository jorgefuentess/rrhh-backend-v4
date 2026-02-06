import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
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
}
