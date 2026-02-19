import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NovedadService } from './novedad.service';
import { CreateNovedadDto } from './novedad.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
@Controller('novedad')
export class NovedadController {
  constructor(private service: NovedadService) { }

  @Get() findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() body: CreateNovedadDto) {
    return this.service.createNovedad(body.licenciaId, body.accion,body.typo);
  }
}