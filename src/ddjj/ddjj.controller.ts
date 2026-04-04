import { Body, Controller, Get, Param, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateDDJJDto } from './dto/create-ddjj.dto';
import { DDJJService } from './ddjj.service';
import { DDJJ } from './ddjj.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@ApiTags('ddjj')
@Controller('ddjj')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo, Role.Secretario, Role.Docente)
export class DDJJController {
  constructor(private readonly ddjjService: DDJJService) {}

  
  @Get()
  findAll(@CurrentUser() currentUser?: CurrentUserPayload): Promise<DDJJ[]> {
    return this.ddjjService.findAll(currentUser?.schoolId);
  }

  @Get('persona/:id')
  findByPersona(@Param('id') id: string, @CurrentUser() currentUser?: CurrentUserPayload): Promise<DDJJ[]> {
    return this.ddjjService.findByPersona(id, currentUser?.schoolId);
  }

  @Post()
  @ApiBody({ type: CreateDDJJDto })
  create(
    @Body() data: CreateDDJJDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<DDJJ> {
    if (!data.personaId) {
      data.personaId = currentUser.personaId;
      console.log('✓ personaId auto-asignado del JWT:', data.personaId);
    }

    if (currentUser.roles?.includes(Role.Docente) && data.personaId !== currentUser.personaId) {
      throw new ForbiddenException('Los docentes solo pueden crear DDJJ para sí mismos');
    }

    console.log('📝 Creando DDJJ:', {
      personaId: data.personaId,
      usuarioAutenticado: currentUser.username,
      rol: currentUser.roles?.[0],
      escuelaId: data.escuelaId,
    });

    return this.ddjjService.create(data, currentUser?.schoolId);
  }
}


