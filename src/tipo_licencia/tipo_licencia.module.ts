import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Nivel } from '../catalogos/nivel.entity';
import { Seccion } from '../catalogos/seccion.entity';
import { Materia } from '../catalogos/materia.entity';
import { TipoLicencia } from './tipo_licencia.entity';
import { TipoLicenciaController } from './tipo_licencia.controller';
import { TipoLicenciaService } from './tipo_licencia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoLicencia]),
  ],
  controllers: [TipoLicenciaController],
  providers: [TipoLicenciaService],
 
})
export class TipoLicenciaModule {}