import { IsUUID, IsString } from 'class-validator';

export class CreateNovedadDto {
  @IsUUID()
  licenciaId: string;

  @IsString()
  accion: string;
}