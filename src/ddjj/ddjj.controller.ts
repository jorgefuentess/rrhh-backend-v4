import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateDDJJDto } from './dto/create-ddjj.dto';
import { DDJJService } from './ddjj.service';
import { DDJJ } from './ddjj.entity';

@ApiTags('ddjj')
@Controller('ddjj')
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
    return this.ddjjService.create(data);
  }
}

