import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateEstructuraCurricularDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nivel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  turno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  seccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  materia?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  horas?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  tipoMateria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  condicion?: string;
}
