import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TipoLicenciaService } from './tipo_licencia.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('tipoLicencia')
export class TipoLicenciaController {

  constructor(private readonly service: TipoLicenciaService) { }

  @Get()
  findAll(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.service.findAll(currentUser?.schoolId);
  }


}