import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateReciboDto {
  @IsUUID()
  docenteId: string;

  @IsInt()
  @Min(2000)
  anio: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;
}
