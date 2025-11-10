import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNivelDto {
  @ApiProperty({ example: 'Primario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
