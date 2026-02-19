import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
  findAll() {
    return this.svcnoDo.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.svcnoDo.create(body);
  }
}