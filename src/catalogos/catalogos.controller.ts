import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Catálogos')
@UseGuards(AuthGuard('jwt'))
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly svc: CatalogosService) {}

  // ------- Nivel -------
  @Get('nivel')
  findNivel(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.findNivel(currentUser?.schoolId);
  }

  @Post('nivel')
  @ApiBody({ type: CreateNivelDto })
  createNivel(@Body() body: CreateNivelDto, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.createNivel(body, currentUser?.schoolId);
  }

  // ------- Sección -------
  @Get('seccion')
  findSeccion(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.findSeccion(currentUser?.schoolId);
  }

  @Post('seccion')
  @ApiBody({ type: CreateSeccionDto })
  createSeccion(@Body() body: CreateSeccionDto, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.createSeccion(body.nombre, body.nivelId, currentUser?.schoolId);
  }

  // ------- Materia -------
  @Get('materia')
  findMateria(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.findMateria(currentUser?.schoolId);
  }

  @Post('materia')
  @ApiBody({ type: CreateMateriaDto })
  createMateria(@Body() body: CreateMateriaDto, @CurrentUser() currentUser?: CurrentUserPayload) {
    return this.svc.createMateria(body.nombre, body.seccionId, currentUser?.schoolId);
  }
}