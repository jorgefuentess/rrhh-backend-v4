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
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('cargos-docentes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class CargosDocentesController {
  constructor(private readonly service: CargosDocentesService) {}

  @Get()
  @Roles(Role.Admin)
  findAll(
    @Query('nivel') nivel?: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.service.findAll(nivel, currentUser?.schoolId);
  }

  @Get('niveles')
  @Roles(Role.Admin)
  findNiveles(@CurrentUser() currentUser?: CurrentUserPayload) {
    return this.service.findNiveles(currentUser?.schoolId);
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
  import(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.service.importExcelReplaceAll(file, currentUser?.schoolId);
  }
}
