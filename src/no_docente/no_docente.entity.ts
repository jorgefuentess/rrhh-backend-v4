import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm'

@Entity()
export class NoDocente {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // === Datos personales ===
  @Column({ nullable: true })
  legajo: string

  @Column()
  apellido: string

  @Column()
  nombre: string

  @Column({ unique: true })
  dni: string

  @Column({ nullable: true })
  cuil: string

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: string

  @Column({ nullable: true })
  provincia: string

  @Column({ nullable: true })
  calle: string

  @Column({ nullable: true })
  numero: string

  @Column({ nullable: true })
  piso: string

  @Column({ nullable: true })
  dpto: string

  @Column({ nullable: true })
  direccion: string

  @Column({ nullable: true })
  codigoPostal: string

  @Column({ nullable: true })
  telefonoCelular: string

  @Column({ nullable: true })
  telefonoFijo: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  obraSocial: string

  @Column({ nullable: true })
  sexo: string

  @Column({ nullable: true })
  estadoCivil: string

  @Column({ type: 'date', nullable: true })
  fechaInicioActividad: string

  @Column({ nullable: true })
  titulacion: string

  // === Nuevos campos booleanos ===
  @Column({ type: 'boolean', default: false })
  pension: boolean

  @Column({ type: 'boolean', default: false })
  embargo: boolean;

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