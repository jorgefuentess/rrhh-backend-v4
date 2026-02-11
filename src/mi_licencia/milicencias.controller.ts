import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MiLicenciasService } from './milicencias.service';
import { Express } from 'express';

@Controller('milicencias')
export class MiLicenciasController {

  constructor(private readonly service: MiLicenciasService) { }

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
    console.log("body nuevo ", body)
    console.log("archivo nuevo ", archivo)
    return this.service.crear(archivo, body);
  }

  @Post('view')
  async viewFile(@Body('id') id: string) {
    const file = await this.service.getFile(id);

    return new StreamableFile(file.buffer, {
      type: file.mimeType,
      disposition: `inline; filename="${file.fileName}"`,
    });
  }

  @Post('download')
  async downloadFile(@Body('id') id: string) {
    const file = await this.service.getFile(id);

    return new StreamableFile(file.buffer, {
      type: file.mimeType,
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }



}
