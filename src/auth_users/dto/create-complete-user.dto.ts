import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateCompleteUserDto {
  // ========== Datos de autenticación ==========
  @ApiProperty({ example: 'docente2', description: 'Username para login' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'clave123', description: 'Contraseña para login' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: Role.Docente, required: false, default: Role.Docente })
  @IsOptional()
  @IsString()
  role?: string;

  // ========== Datos de persona ==========
  @ApiProperty({ example: '12345', required: false })
  @IsOptional()
  @IsString()
  legajo?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  dni: string;

  @ApiProperty({ example: '20-12345678-9', required: false })
  @IsOptional()
  @IsString()
  cuil?: string;

  @ApiProperty({ example: '1985-05-20', required: false })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiProperty({ example: 'Tucumán', required: false })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiProperty({ example: 'Av. Mitre', required: false })
  @IsOptional()
  @IsString()
  calle?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({ example: '5', required: false })
  @IsOptional()
  @IsString()
  piso?: string;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  dpto?: string;

  @ApiProperty({ example: '381-1234567', required: false })
  @IsOptional()
  @IsString()
  telefonoCelular?: string;

  @ApiProperty({ example: '381-7654321', required: false })
  @IsOptional()
  @IsString()
  telefonoFijo?: string;

  @ApiProperty({ example: 'juan.perez@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'OSDE', required: false })
  @IsOptional()
  @IsString()
  obraSocial?: string;

  @ApiProperty({ example: 'Masculino', required: false })
  @IsOptional()
  @IsString()
  sexo?: string;

  @ApiProperty({ example: 'Casado', required: false })
  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @ApiProperty({ example: '2010-03-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaInicioActividad?: string;

  @ApiProperty({ example: 'Licenciado en Matemática', required: false })
  @IsOptional()
  @IsString()
  titulacion?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  pension?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  embargo?: boolean;
}
