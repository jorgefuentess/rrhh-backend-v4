import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { CargosDocentesService } from 'src/cargos_docentes/cargos_docentes.service';

@Controller('cargos-docentes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class CargosDocentesController {
  constructor(private readonly service: CargosDocentesService) {}

  @Get()
  @Roles(Role.Admin, Role.Secretario)
  findAll(@Query('nivel') nivel?: string) {
    return this.service.findAll(nivel);
  }

  @Get('niveles')
  @Roles(Role.Admin, Role.Secretario)
  findNiveles() {
    return this.service.findNiveles();
  }

  @Post('import')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Importa cargos docentes desde Excel (reemplazo total)' })
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
