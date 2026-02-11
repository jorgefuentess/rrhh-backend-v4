import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ServiciosService } from './servicios.service';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly svc: ServiciosService) { }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.svc.update(id, data);
  }
}