import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NovedadService } from './novedad.service';
import { CreateNovedadDto } from './novedad.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Roles(Role.Admin)
@Controller('novedad')
export class NovedadController {
  constructor(private service: NovedadService) { }

  @Get()
  async findAll() {
    const novedades = await this.service.findAll();
    console.log(`✓ GET /novedad - Retrieved ${novedades.length} records`);
    return novedades;
  }

  @Post()
  create(@Body() body: CreateNovedadDto) {
    console.log('POST /novedad body:', body);
    return this.service.createNovedad(body.datoid, body.accion, body.typo);
  }
}