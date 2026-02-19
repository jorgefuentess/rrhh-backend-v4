import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common'
import { NoDocente } from './no_docente.entity'
import { NoDocenteService } from './no_docente.service'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/enums/role.enum'

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
@Controller('nodocente')
export class NoDocenteController {
  constructor(private readonly usersService: NoDocenteService) {}

  @Get()
  findAll(): Promise<NoDocente[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<NoDocente | null> {  // 👈 ajustado
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() dataDTO: any): Promise<NoDocente> {
    return this.usersService.create(dataDTO)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<NoDocente>): Promise<NoDocente | null> { // 👈 ajustado
    return this.usersService.update(id, data)
  }

  @Delete(':id') 
  remove(@Param('id') id: string) {
    console.log("id del usuario",id)
     return this.usersService.remove(id); 
  }
  

}