import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Body,
  Query,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { EstructuraCurricularService } from './estructura_curricular.service';
import { UpdateEstructuraCurricularDto } from './dto/update-estructura-curricular.dto';

@Controller('estructura-curricular')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class EstructuraCurricularController {
  constructor(private readonly service: EstructuraCurricularService) {}

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.service.findAll();
  }

  @Get('niveles')
  @Roles(Role.Admin)
  findNiveles() {
    return this.service.findNiveles();
  }

  @Get('turnos')
  @Roles(Role.Admin)
  findTurnos(@Query('nivel') nivel: string) {
    return this.service.findTurnosByNivel(nivel);
  }

  @Get('secciones')
  @Roles(Role.Admin)
  findSecciones(@Query('nivel') nivel: string, @Query('turno') turno: string) {
    return this.service.findSecciones(nivel, turno);
  }

  @Get('materias')
  @Roles(Role.Admin)
  findMaterias(
    @Query('nivel') nivel: string,
    @Query('turno') turno: string,
    @Query('seccion') seccion: string,
  ) {
    return this.service.findMaterias(nivel, turno, seccion);
  }

  @Put(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() body: UpdateEstructuraCurricularDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('import')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Importa estructura curricular desde Excel (reemplazo total)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.service.importExcelReplaceAll(file);
  }
}
