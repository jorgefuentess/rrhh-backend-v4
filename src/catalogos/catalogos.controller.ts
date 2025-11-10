import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CreateMateriaDto } from './dto/create-materia.dto';

@ApiTags('Catálogos')
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly svc: CatalogosService) {}  // 👈 este constructor faltaba

  // ------- Nivel -------
  @Get('nivel')
  findNivel() {
    return this.svc.findNivel();
  }

  @Post('nivel')
  @ApiBody({ type: CreateNivelDto })
  createNivel(@Body() body: CreateNivelDto) {
    return this.svc.createNivel(body);
  }

  // ------- Sección -------
  @Get('seccion')
  findSeccion() {
    return this.svc.findSeccion();
  }

  @Post('seccion')
  @ApiBody({ type: CreateSeccionDto })
  createSeccion(@Body() body: CreateSeccionDto) {
    return this.svc.createSeccion(body.nombre, body.nivelId);
  }

  // ------- Materia -------
  @Get('materia')
  findMateria() {
    return this.svc.findMateria();
  }

  @Post('materia')
  @ApiBody({ type: CreateMateriaDto })
  createMateria(@Body() body: CreateMateriaDto) {
    return this.svc.createMateria(body.nombre, body.seccionId);
  }
}