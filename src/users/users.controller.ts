import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from './user.entity'
import { CreateUserDto } from './DTO/create-user.dto'

import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Secretario, Role.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {  // 👈 ajustado
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() dataDTO: CreateUserDto): Promise<User> {
    return this.usersService.create(dataDTO)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<User>): Promise<User | null> { // 👈 ajustado
    return this.usersService.update(id, data)
  }

  @Delete(':id') 
  remove(@Param('id') id: string) {
    console.log("id del usuario",id)
     return this.usersService.remove(id); 
  }
  

}