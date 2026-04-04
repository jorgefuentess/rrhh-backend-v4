import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LicenciasService } from './licencias.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('licencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo, Role.Secretario)
export class LicenciasController {
  constructor(private service: LicenciasService) {}

  @Get()
  findAll(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.service.findAll(currentUser?.schoolId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() currentUser?: CurrentUserPayload) { 
    console.log('POST /licencias body:', body);
    return this.service.create(body, currentUser?.schoolId); 
  }
  
}