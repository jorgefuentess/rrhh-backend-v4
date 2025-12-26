import { Controller, Get, Post, Body } from '@nestjs/common';
import { LicenciasService } from './licencias.service';

@Controller('licencias')
export class LicenciasController {
  constructor(private service: LicenciasService) {}

  @Get() findAll() { return this.service.findAll(); }

  @Post() create(@Body() body: any) { 
    return this.service.create(body); 
  }
}