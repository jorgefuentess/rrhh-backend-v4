import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSeccionDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 1, description: 'ID del nivel asociado' })
  @IsInt()
  @IsNotEmpty()
  nivelId: number;
}
