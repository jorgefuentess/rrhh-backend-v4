import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (config.get<string>('JWT_SECRET') || process.env.JWT_SECRET) as string,
    });
  }

  async validate(payload: any) {
    // ✅ Normalizar: aceptar tanto role (string) como roles (array)
    const roles = Array.isArray(payload.roles) 
      ? payload.roles 
      : payload.role 
      ? [payload.role] 
      : [];
    
    return {
      ...payload,
      roles,  // ✅ Siempre devolver array
      personaTipo: payload.personaTipo,
    };
  }
}
