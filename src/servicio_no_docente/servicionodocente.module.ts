import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioNoDocenteController } from './servicionodocente.controller';

import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';
import { ServicioNoDocente } from './servicionodocente.entity';
import { ServiciosService } from 'src/servicios/servicios.service';
import { ServicioNoDocenteService } from './servicionodocente.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioNoDocente, User, Nivel, Seccion, Materia]),
  ],
  controllers: [ServicioNoDocenteController],
  providers: [ServicioNoDocenteService],

})
export class ServicioNoDocenteModule {}