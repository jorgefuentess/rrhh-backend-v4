import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthUsersService } from '../auth_users/auth_users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: AuthUsersService, private jwt: JwtService) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result as any;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return { access_token: this.jwt.sign(payload), user: payload };
  }
}