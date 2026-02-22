import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateAuthUserDto {
  @ApiProperty({ example: 'docente2', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'nuevaClave123', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: Role.Docente, required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    example: '66d6f021-6a34-403e-8eb7-3938f0780122',
    required: false,
    description: 'UUID de la persona (User.id). Obligatorio para Docente/Secretario.',
  })
  @IsOptional()
  @IsUUID('4')
  personaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
