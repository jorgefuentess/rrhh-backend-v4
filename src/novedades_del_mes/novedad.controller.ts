import { Controller, Get, Post, Body } from '@nestjs/common';
import { NovedadService } from './novedad.service';
import { CreateNovedadDto } from './novedad.dto';


@Controller('novedad')
export class NovedadController {
  constructor(private service: NovedadService) { }

  @Get() findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() body: CreateNovedadDto) {
    return this.service.createNovedad(body.licenciaId, body.accion);
  }
}