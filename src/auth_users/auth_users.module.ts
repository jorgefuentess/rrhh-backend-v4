import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from './auth_users.entity';
import { AuthUsersService } from './auth_users.service';
import { AuthUsersController } from './auth_users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUser])],
  providers: [AuthUsersService],
  controllers: [AuthUsersController],
  exports: [AuthUsersService],
})
export class AuthUsersModule {}