import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { PersonaTipoAuth } from '../auth_users.entity';

/**
 * DTO para vincular una Persona existente con un nuevo AuthUser
 * Flujo: Secretario crea personas, Admin vincula con usuarios de sistema
 */
export class LinkUserToPersonaDto {
  @ApiProperty({ example: 'docente2', description: 'Username para login' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'clave123', description: 'Contraseña para login' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: [Role.Docente, Role.Secretario],
    required: false,
    description: 'Array de roles del usuario (Admin, Docente, Secretario)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  // ⚠️ Mantener compatibilidad con role único (se convertirá a array)
  @ApiProperty({
    example: Role.Docente,
    required: false,
    description: 'Rol único (deprecated - usar roles[])',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la Persona existente a vincular',
  })
  @IsNotEmpty()
  @IsUUID('4')
  personaId: string;

  @ApiProperty({
    example: PersonaTipoAuth.DOCENTE,
    required: false,
    description: 'Tipo de persona vinculada al usuario: DOCENTE o NO_DOCENTE',
  })
  @IsOptional()
  @IsString()
  personaTipo?: string;
}
