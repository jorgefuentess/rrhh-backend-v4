import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from './user.entity'

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
  create(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.create(data)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<User>): Promise<User | null> { // 👈 ajustado
    return this.usersService.update(id, data)
  }
}