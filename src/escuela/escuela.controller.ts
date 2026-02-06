import { Controller, Get, Post, Body } from '@nestjs/common';
import { Escuela } from './escuela.entity';
import { EscuelaService } from './escuela.service';

@Controller('escuela')
export class EscuelaController {
  constructor(private service: EscuelaService) {}

  @Get() findAll() { return this.service.findAll(); }

  @Post() create(@Body() body: any) { 
    return this.service.create(body); 
  }
}