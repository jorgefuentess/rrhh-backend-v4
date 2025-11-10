import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMateriaDto {
  @ApiProperty({ example: 'Matemática' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 3, description: 'ID de la sección asociada' })
  @IsInt()
  @IsNotEmpty()
  seccionId: number;
}