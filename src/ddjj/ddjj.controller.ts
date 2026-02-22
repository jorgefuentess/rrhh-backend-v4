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
@Roles(Role.Docente, Role.Admin)
export class DDJJController {
  constructor(private readonly ddjjService: DDJJService) {}

  
  @Get()
  findAll(): Promise<DDJJ[]> {
    return this.ddjjService.findAll();
  }

  @Get('persona/:id')
  findByPersona(@Param('id') id: string): Promise<DDJJ[]> {
    return this.ddjjService.findByPersona(id);
  }

  @Post()
  @ApiBody({ type: CreateDDJJDto })
  create(
    @Body() data: CreateDDJJDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<DDJJ> {
    // ✨ NUEVO: Si no envía personaId, usar el del JWT
    if (!data.personaId) {
      data.personaId = currentUser.personaId;
      console.log('✓ personaId auto-asignado del JWT:', data.personaId);
    }

    // ✨ NUEVO: Validar que Docente solo cree para sí mismo
    if (currentUser.role === 'Docente' && data.personaId !== currentUser.personaId) {
      throw new ForbiddenException('Los docentes solo pueden crear DDJJ para sí mismos');
    }

    console.log('📝 Creando DDJJ:', {
      personaId: data.personaId,
      usuarioAutenticado: currentUser.username,
      rol: currentUser.role,
      escuelaId: data.escuelaId,
    });

    return this.ddjjService.create(data);
  }
}


