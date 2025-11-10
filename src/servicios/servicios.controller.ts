import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServiciosService } from './servicios.service';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly svc: ServiciosService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }
}