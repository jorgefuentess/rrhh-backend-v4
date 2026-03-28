import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  BajaSalarioFamiliarDependienteDto,
  CreateSalarioFamiliarDto,
  CreateSalarioFamiliarPagoDto,
} from './dto/create-salario-familiar.dto';
import {
  UpdateSalarioFamiliarDto,
  UpdateSalarioFamiliarPagoDto,
} from './dto/update-salario-familiar.dto';
import { SalarioFamiliarService } from './salario_familiar.service';

@Controller('salario-familiar')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo, Role.Secretario)
export class SalarioFamiliarController {
  constructor(private readonly service: SalarioFamiliarService) {}

  @Get()
  findAll(@Query('activo') activo?: string, @Query('search') search?: string) {
    return this.service.findAll({ activo, search });
  }

  @Get('personas')
  getPersonas() {
    return this.service.getPersonas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSalarioFamiliarDto) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateSalarioFamiliarDto) {
    return this.service.update(id, body);
  }

  @Put('conyuge/:id/baja')
  darBajaConyuge(@Param('id') id: string, @Body() body: BajaSalarioFamiliarDependienteDto) {
    return this.service.darBajaConyuge(id, body);
  }

  @Put('hijos/:id/baja')
  darBajaHijo(@Param('id') id: string, @Body() body: BajaSalarioFamiliarDependienteDto) {
    return this.service.darBajaHijo(id, body);
  }

  @Post(':id/pagos')
  createPago(@Param('id') id: string, @Body() body: CreateSalarioFamiliarPagoDto) {
    return this.service.createPago(id, body);
  }

  @Put('pagos/:id')
  updatePago(@Param('id') id: string, @Body() body: UpdateSalarioFamiliarPagoDto) {
    return this.service.updatePago(id, body);
  }
}