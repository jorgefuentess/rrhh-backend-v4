import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete, Query } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('servicios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ServiciosController {
  constructor(private readonly svc: ServiciosService) { }

  @Get()
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  findAll(
    @Query('activo') activo?: string,
    @Query('search') search?: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.svc.findAll(activo, search, currentUser?.schoolId);
  }

  @Post()
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  create(@Body() body: any, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.create(body, currentUser?.schoolId);
  }
  
  @Put(':id')
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  update(@Param('id') id: string, @Body() data: any) {
    return this.svc.update(id, data);
  }

  @Put(':id/baja')
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  darBaja(@Param('id') id: string, @Body() body: { motivo: string; fechaBaja?: string }) {
    return this.svc.darBaja(id, body.motivo, body.fechaBaja);
  }

  @Put(':id/alta')
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  darAlta(@Param('id') id: string) {
    return this.svc.darAlta(id);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Administrativo, Role.Secretario)
  remove(@Param('id') id: string) {
    
    return this.svc.remove(id);
  }
}