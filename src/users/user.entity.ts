import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Servicio } from '../servicios/servicio.entity'
import { Licencia } from '../licencias/licencia.entity'

@Entity()
export class User {
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
  embargo: boolean

  // === Relaciones ===
  @OneToMany(() => Servicio, (servicio) => servicio.user)
  servicios: Servicio[]

  @OneToMany(() => Licencia, (licencia) => licencia.user)
  licencias: Licencia[]
}