import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateArchivoDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsDateString()
  fechaSistema?: string;

  @IsOptional()
  @IsDateString()
  fechaModificacion?: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  cantidadDias?: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  tipoMime: string;

  @IsInt()
  tamano: number;

  @IsNotEmpty()
  contenido: Buffer;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
