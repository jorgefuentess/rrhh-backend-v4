import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServicioNoDocente } from './servicionodocente.entity';
import { ServicioNoDocenteService } from './servicionodocente.service';

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