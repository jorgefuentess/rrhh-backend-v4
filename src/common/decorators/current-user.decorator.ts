import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para obtener el usuario actual del JWT
 * Uso: @CurrentUser() user
 *
 * Retorna el payload del JWT con:
 * - username
 * - sub (AuthUser.id)
 * - personaId (User.id - UUID)
 * - role
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;  // Viene del JwtStrategy.validate()
  },
);

/**
 * Interfaz para el payload del usuario autenticado
 */
export interface CurrentUserPayload {
  username: string;
  sub: number;                 // AuthUser.id (número)
  personaId: string;           // User.id (UUID)
  role: string;
  iat?: number;
  exp?: number;
}
