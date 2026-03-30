import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthUsersService } from './auth_users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { UpdateAuthUserDto } from './dto/update-auth-user.dto';
import { LinkUserToPersonaDto } from './dto/link-user-to-persona.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo, Role.Secretario)
@Controller('auth/users')
export class AuthUsersController {
  constructor(private service: AuthUsersService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user?.schoolId);
  }

  @Post()
  create(@Req() req: any, @Body() body: CreateAuthUserDto) {
    return this.service.create(body, req.user?.schoolId);
  }
  
  /**
   * Vincula una Persona existente con un nuevo AuthUser
   * Flujo: Admin selecciona persona (creada por secretario) y crea usuario de sistema
   */
  @Post('link-persona')
  linkUserToPersona(@Req() req: any, @Body() body: LinkUserToPersonaDto) {
    return this.service.linkUserToPersona(body, req.user?.schoolId);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: number, @Body() body: UpdateAuthUserDto) {
    return this.service.update(+id, body, req.user?.schoolId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: number) {
    return this.service.remove(+id, req.user?.schoolId);
  }
}