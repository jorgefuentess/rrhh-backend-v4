import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@Controller('servicios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    
    return this.svc.remove(id);
  }
}