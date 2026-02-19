import { IsUUID, IsString } from 'class-validator';

export class CreateNovedadDto {
  @IsUUID()
  datoid: string;

  @IsString()
  accion: string;

  @IsString()
  typo: string;
}