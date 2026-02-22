import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateAuthUserDto {
  @ApiProperty({ example: 'docente2' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'clave123' })
  @IsNotEmpty()
  @IsString()
  password: string;

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

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
