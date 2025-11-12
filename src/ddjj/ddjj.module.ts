import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DDJJ } from './ddjj.entity';
import { DDJJController } from './ddjj.controller';
import { DDJJService } from './ddjj.service';
import { User } from '../users/user.entity';
import { Servicio } from '../servicios/servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DDJJ, User, Servicio])],
  controllers: [DDJJController],
  providers: [DDJJService],
})
export class DDJJModule {}