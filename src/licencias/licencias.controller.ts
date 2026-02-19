import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LicenciasService } from './licencias.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@Controller('licencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
export class LicenciasController {
  constructor(private service: LicenciasService) {}

  @Get() findAll() { return this.service.findAll(); }

  @Post() create(@Body() body: any) { 
    return this.service.create(body); 
  }
  
}