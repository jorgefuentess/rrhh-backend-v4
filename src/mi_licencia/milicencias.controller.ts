import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MiLicenciasService } from './milicencias.service';
import { Express } from 'express';

@Controller('milicencias')
export class MiLicenciasController {

  constructor(private readonly service: MiLicenciasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  async create(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log("body nuevo ",body)
    console.log("archivo nuevo ",archivo)
    return this.service.crear(archivo, body);
  }
}
