import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ConformidadDto {
  @IsIn(['conforme', 'no_conforme'])
  conformidad: 'conforme' | 'no_conforme';

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.conformidad === 'no_conforme')
  @IsNotEmpty()
  observacion?: string;
}
