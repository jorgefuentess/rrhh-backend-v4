import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  // === Datos personales ===

  @IsOptional()
  @IsString()
  legajo?: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  dni: string;

  @IsOptional()
  @IsString()
  cuil?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  calle?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  piso?: string;

  @IsOptional()
  @IsString()
  dpto?: string;

  @IsOptional()
  @IsString()
  telefonoCelular?: string;

  @IsOptional()
  @IsString()
  telefonoFijo?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsDateString()
  fechaInicioActividad?: string;

  @IsOptional()
  @IsString()
  titulacion?: string;

  // === Campos booleanos ===

  @IsOptional()
  @IsBoolean()
  pension?: boolean;

  @IsOptional()
  @IsBoolean()
  embargo?: boolean;
}
