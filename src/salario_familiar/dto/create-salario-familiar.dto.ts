import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SalarioFamiliarEstadoCivil,
  SalarioFamiliarPersonaTipo,
} from '../salario_familiar.entity';
import {
  SalarioFamiliarMotivoBaja,
  SalarioFamiliarNivelEscolar,
} from '../salario_familiar_hijo.entity';
import { SalarioFamiliarTipoAsignacion } from '../salario_familiar_pago.entity';

export class SalarioFamiliarConyugeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsBoolean()
  pagoSalario: boolean;

  @IsOptional()
  @IsString()
  motivoNoPago?: string;
}

export class SalarioFamiliarHijoDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  cuil: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsEnum(SalarioFamiliarNivelEscolar)
  nivelEscolar: SalarioFamiliarNivelEscolar;

  @IsBoolean()
  discapacidad: boolean;

  @IsBoolean()
  pagoSalario: boolean;

  @IsOptional()
  @IsString()
  motivoNoPago?: string;
}

export class CreateSalarioFamiliarPagoDto {
  @IsEnum(SalarioFamiliarTipoAsignacion)
  tipoAsignacion: SalarioFamiliarTipoAsignacion;

  @IsDateString()
  fechaSolicitud: string;

  @IsDateString()
  periodoLiquidacion: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class BajaSalarioFamiliarDependienteDto {
  @IsEnum(SalarioFamiliarMotivoBaja)
  motivoBaja: SalarioFamiliarMotivoBaja;

  @IsDateString()
  fechaBaja: string;
}

export class CreateSalarioFamiliarDto {
  @IsEnum(SalarioFamiliarPersonaTipo)
  personaTipo: SalarioFamiliarPersonaTipo;

  @IsOptional()
  @IsString()
  docenteId?: string;

  @IsOptional()
  @IsString()
  noDocenteId?: string;

  @IsEnum(SalarioFamiliarEstadoCivil)
  estadoCivil: SalarioFamiliarEstadoCivil;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SalarioFamiliarConyugeDto)
  conyuge?: SalarioFamiliarConyugeDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => SalarioFamiliarHijoDto)
  hijos?: SalarioFamiliarHijoDto[];
}