import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete, Query } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@Controller('servicios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
export class ServiciosController {
  constructor(private readonly svc: ServiciosService) { }

  @Get()
  findAll(@Query('activo') activo?: string) {
    return this.svc.findAll(activo);
  }

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.svc.update(id, data);
  }

  @Put(':id/baja')
  darBaja(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.svc.darBaja(id, body.motivo);
  }

  @Put(':id/alta')
  darAlta(@Param('id') id: string) {
    return this.svc.darAlta(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    
    return this.svc.remove(id);
  }
}