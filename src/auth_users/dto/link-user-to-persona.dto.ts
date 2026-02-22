import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

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
    example: Role.Docente,
    required: false,
    default: Role.Docente,
    description: 'Rol del usuario (Admin, Docente, Secretario)',
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la Persona existente a vincular',
  })
  @IsNotEmpty()
  @IsUUID('4')
  personaId: string;
}
