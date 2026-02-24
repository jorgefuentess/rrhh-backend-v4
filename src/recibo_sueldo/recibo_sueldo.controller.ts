import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';

import { ReciboSueldoService } from './recibo_sueldo.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { ConformidadDto } from './dto/conformidad.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('recibos')
export class ReciboSueldoController {
  constructor(private readonly service: ReciboSueldoService) {}

  @Roles(Role.Admin)
  @Get()
  findAll(
    @Query('docenteId') docenteId?: string,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
  ) {
    return this.service.findAll({
      docenteId,
      anio: anio ? Number(anio) : undefined,
      mes: mes ? Number(mes) : undefined,
    });
  }

  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadRecibo(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const docenteId = body.docenteId;
    const anio = Number(body.anio);
    const mes = Number(body.mes);
    return this.service.create(docenteId, anio, mes, file);
  }

  @Roles(Role.Admin)
  @Post('zip')
  @UseInterceptors(FileInterceptor('file'))
  uploadZip(@UploadedFile() file: Express.Multer.File) {
    return this.service.createFromZip(file);
  }

  @Roles(Role.Admin, Role.Docente)
  @Get('docente/:docenteId')
  getByDocente(
    @Param('docenteId') docenteId: string,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    if (currentUser?.role === Role.Docente && currentUser.personaId !== docenteId) {
      return [];
    }
    return this.service.findByDocente(docenteId, anio ? Number(anio) : undefined, mes ? Number(mes) : undefined);
  }

  @Roles(Role.Admin, Role.Docente)
  @Put(':id/conformidad')
  async setConformidad(
    @Param('id') id: string,
    @Body() body: ConformidadDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    // Docente solo puede confirmar sus propios recibos
    if (currentUser?.role === Role.Docente) {
      const recibo = await this.service.getById(id);
      if (recibo.docente?.id !== currentUser.personaId) {
        return null;
      }
    }
    return this.service.updateConformidad(id, body.conformidad, body.observacion);
  }

  @Roles(Role.Admin, Role.Docente)
  @Get(':id/archivo')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    const recibo = await this.service.getFile(id);
    if (currentUser?.role === Role.Docente && recibo.docente?.id !== currentUser.personaId) {
      return res.status(403).send('No autorizado');
    }
    const file = fs.readFileSync(recibo.archivoRuta);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${recibo.archivoNombre}"`);
    res.send(file);
  }
}
