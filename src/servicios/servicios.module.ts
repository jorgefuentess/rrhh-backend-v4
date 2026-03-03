import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { Servicio } from './servicio.entity';
import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';
import { Escuela } from '../escuela/escuela.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Servicio, User, Nivel, Seccion, Materia, Escuela]),
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}