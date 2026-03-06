import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReciboSueldo } from './recibo_sueldo.entity';
import { ReciboSueldoService } from './recibo_sueldo.service';
import { ReciboSueldoController } from './recibo_sueldo.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReciboSueldo, User])],
  providers: [ReciboSueldoService],
  controllers: [ReciboSueldoController],
})
export class ReciboSueldoModule {}
