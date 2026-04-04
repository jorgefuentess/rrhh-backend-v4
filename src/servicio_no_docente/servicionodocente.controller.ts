import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ServicioNoDocente } from './servicionodocente.entity';
import { ServicioNoDocenteService } from './servicionodocente.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo)
@Controller('servicionodocente')
export class ServicioNoDocenteController {
  constructor(private readonly svcnoDo: ServicioNoDocenteService) {}

  @Get()
  findAll(@Query('activo') activo?: string, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svcnoDo.findAll(activo, currentUser?.schoolId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svcnoDo.create(body, currentUser?.schoolId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svcnoDo.update(id, body);
  }

  @Put(':id/baja')
  darBaja(@Param('id') id: string, @Body() body: { motivo: string; fechaBaja?: string }) {
    return this.svcnoDo.darBaja(id, body.motivo, body.fechaBaja);
  }

  @Put(':id/alta')
  darAlta(@Param('id') id: string) {
    return this.svcnoDo.darAlta(id);
  }
}