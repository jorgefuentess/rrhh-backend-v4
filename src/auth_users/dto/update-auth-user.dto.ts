import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { PersonaTipoAuth } from '../auth_users.entity';

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
    example: [Role.Docente, Role.Secretario],
    required: false,
    description: 'Array de roles del usuario',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    example: '66d6f021-6a34-403e-8eb7-3938f0780122',
    required: false,
    description: 'UUID de la persona (User.id o NoDocente.id).',
  })
  @IsOptional()
  @IsUUID('4')
  personaId?: string;

  @ApiProperty({
    example: PersonaTipoAuth.DOCENTE,
    required: false,
    description: 'Tipo de persona vinculada al usuario: DOCENTE o NO_DOCENTE',
  })
  @IsOptional()
  @IsString()
  personaTipo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
