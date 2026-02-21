import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateDDJJDto } from './dto/create-ddjj.dto';
import { DDJJService } from './ddjj.service';
import { DDJJ } from './ddjj.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
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
  create(@Body() data: CreateDDJJDto): Promise<DDJJ> {

    console.log("data a enviar",data)
    return this.ddjjService.create(data);
  }
}

