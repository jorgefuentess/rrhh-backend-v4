import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from './auth_users.entity';
import { AuthUsersService } from './auth_users.service';
import { AuthUsersController } from './auth_users.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUser])],
  providers: [AuthUsersService, RolesGuard],
  controllers: [AuthUsersController],
  exports: [AuthUsersService],
})
export class AuthUsersModule {}