import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RetencionPersonaTipo, RetencionTipo } from '../retencion.entity';

export class CreateRetencionDto {
  @IsEnum(RetencionTipo)
  tipoRetencion: RetencionTipo;

  @IsEnum(RetencionPersonaTipo)
  personaTipo: RetencionPersonaTipo;

  @IsOptional()
  @IsString()
  docenteId?: string;

  @IsOptional()
  @IsString()
  noDocenteId?: string;

  @IsString()
  @IsNotEmpty()
  expedienteOficio: string;

  @IsOptional()
  @IsString()
  caratula?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pensionPorcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pensionImporte?: number;

  @IsOptional()
  @IsString()
  pensionCuentaJudicial?: string;

  @IsOptional()
  @IsString()
  embargoCuentaJudicialCapital?: string;

  @IsOptional()
  @IsString()
  embargoCuentaJudicialHonorarios?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  embargoMontoCapital?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  embargoMontoHonorarios?: number;

  @IsOptional()
  @IsString()
  inicioRetencion?: string;

  @IsOptional()
  @IsString()
  finRetencion?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  cantidadCuotas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  importeTotalCuota?: number;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsArray()
  boletas?: Array<string | number>;
}
