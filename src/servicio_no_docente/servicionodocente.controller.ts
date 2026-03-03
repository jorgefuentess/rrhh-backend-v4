import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ServicioNoDocente } from './servicionodocente.entity';
import { ServicioNoDocenteService } from './servicionodocente.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
@Controller('servicionodocente')
export class ServicioNoDocenteController {
  constructor(private readonly svcnoDo: ServicioNoDocenteService) {}

  @Get()
  findAll(@Query('activo') activo?: string) {
    return this.svcnoDo.findAll(activo);
  }

  @Post()
  create(@Body() body: any) {
    return this.svcnoDo.create(body);
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