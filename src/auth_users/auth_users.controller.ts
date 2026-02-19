import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthUsersService } from './auth_users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@Controller('auth/users')
export class AuthUsersController {
  constructor(private service: AuthUsersService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Put(':id') update(@Param('id') id: number, @Body() body: any) { return this.service.update(+id, body); }
  @Delete(':id') remove(@Param('id') id: number) { return this.service.remove(+id); }
}