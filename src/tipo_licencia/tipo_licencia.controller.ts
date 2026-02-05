import { Controller, Get, Post, Body } from '@nestjs/common';
import { TipoLicenciaService } from './tipo_licencia.service';


@Controller('tipoLicencia')
export class TipoLicenciaController {

  constructor(private readonly service: TipoLicenciaService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }


}