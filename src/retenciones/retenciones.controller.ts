import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CreateRetencionDto } from './dto/create-retencion.dto';
import { UpdateRetencionDto } from './dto/update-retencion.dto';
import { RetencionTipo } from './retencion.entity';
import { RetencionesService } from './retenciones.service';

@Controller('retenciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo, Role.Secretario)
export class RetencionesController {
  constructor(private readonly service: RetencionesService) {}

  @Get()
  findAll(
    @Query('activo') activo?: string,
    @Query('tipoRetencion') tipoRetencion?: RetencionTipo,
    @Query('search') search?: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.service.findAll({ activo, tipoRetencion, search, schoolId: currentUser?.schoolId });
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
  create(@Body() body: CreateRetencionDto, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.service.create(body, currentUser?.schoolId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRetencionDto) {
    return this.service.update(id, body);
  }

  @Put(':id/baja')
  darBaja(
    @Param('id') id: string,
    @Body() body: { motivo?: string; fechaBaja?: string; expedienteOficio?: string },
  ) {
    return this.service.darBaja(id, body);
  }

  @Put(':id/alta')
  darAlta(@Param('id') id: string) {
    return this.service.darAlta(id);
  }
}
