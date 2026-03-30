import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from './auth_users.entity';
import { AuthUsersService } from './auth_users.service';
import { AuthUsersController } from './auth_users.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { User } from '../users/user.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { School } from '../schools/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUser, User, NoDocente, School])],
  providers: [AuthUsersService, RolesGuard],
  controllers: [AuthUsersController],
  exports: [AuthUsersService],
})
export class AuthUsersModule {}