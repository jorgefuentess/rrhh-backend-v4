import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SalarioFamiliarEstadoCivil,
  SalarioFamiliarPersonaTipo,
} from '../salario_familiar.entity';
import { SalarioFamiliarNivelEscolar } from '../salario_familiar_hijo.entity';
import { SalarioFamiliarTipoAsignacion } from '../salario_familiar_pago.entity';

export class UpdateSalarioFamiliarConyugeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  pagoSalario?: boolean;

  @IsOptional()
  @IsString()
  motivoNoPago?: string;
}

export class UpdateSalarioFamiliarHijoDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  cuil?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(SalarioFamiliarNivelEscolar)
  nivelEscolar?: SalarioFamiliarNivelEscolar;

  @IsOptional()
  @IsBoolean()
  discapacidad?: boolean;

  @IsOptional()
  @IsBoolean()
  pagoSalario?: boolean;

  @IsOptional()
  @IsString()
  motivoNoPago?: string;
}

export class UpdateSalarioFamiliarPagoDto {
  @IsOptional()
  @IsEnum(SalarioFamiliarTipoAsignacion)
  tipoAsignacion?: SalarioFamiliarTipoAsignacion;

  @IsOptional()
  @IsDateString()
  fechaSolicitud?: string;

  @IsOptional()
  @IsDateString()
  periodoLiquidacion?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class UpdateSalarioFamiliarDto {
  @IsOptional()
  @IsEnum(SalarioFamiliarPersonaTipo)
  personaTipo?: SalarioFamiliarPersonaTipo;

  @IsOptional()
  @IsString()
  docenteId?: string;

  @IsOptional()
  @IsString()
  noDocenteId?: string;

  @IsOptional()
  @IsEnum(SalarioFamiliarEstadoCivil)
  estadoCivil?: SalarioFamiliarEstadoCivil;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSalarioFamiliarConyugeDto)
  conyuge?: UpdateSalarioFamiliarConyugeDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => UpdateSalarioFamiliarHijoDto)
  hijos?: UpdateSalarioFamiliarHijoDto[];
}