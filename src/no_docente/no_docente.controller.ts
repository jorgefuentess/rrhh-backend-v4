import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards } from '@nestjs/common'
import { NoDocente } from './no_docente.entity'
import { NoDocenteService } from './no_docente.service'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/enums/role.enum'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin, Role.Administrativo)
@Controller('nodocente')
export class NoDocenteController {
  constructor(private readonly usersService: NoDocenteService) {}

  @Get()
  findAll(@Req() req: any): Promise<NoDocente[]> {
    return this.usersService.findAll(req.user?.schoolId)
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string): Promise<NoDocente | null> {  // 👈 ajustado
    return this.usersService.findOne(id, req.user?.schoolId)
  }

  @Post()
  create(@Req() req: any, @Body() dataDTO: any): Promise<NoDocente> {
    return this.usersService.create(dataDTO, req.user?.schoolId)
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() data: Partial<NoDocente>): Promise<NoDocente | null> { // 👈 ajustado
    return this.usersService.update(id, data, req.user?.schoolId)
  }

  @Delete(':id') 
  remove(@Req() req: any, @Param('id') id: string) {
    console.log("id del usuario",id)
     return this.usersService.remove(id, req.user?.schoolId); 
  }
  

}