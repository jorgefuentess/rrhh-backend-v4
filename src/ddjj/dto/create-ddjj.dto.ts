import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Column } from 'typeorm';

export class CreateDDJJDto {
  @ApiProperty({
    example: '66df021-6a34-403e-8eb7-3938f0780122',
    description: 'UUID de la persona (User.id)',
  })
  @IsUUID('4')
  personaId: string;

  @ApiProperty({
    example: 10,
    description: 'Horas/cargos en otros establecimientos PRIVADOS',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  cargosHsPrivados?: number;

  @ApiProperty({
    example: 10,
    description: 'Horas/cargos en otros establecimientos ',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  horas?: number;

  @ApiProperty({
    example: 5,
    description: 'Horas/cargos en establecimientos PÚBLICOS',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  cargosHsPublicos?: number;

  @ApiProperty({
    example: '66df021-6a34-403e-8eb7-3938f0780122',
    description: 'UUID de la escuela (User.id)',
  })
  @IsUUID('4')
  escuelaId: string;
}