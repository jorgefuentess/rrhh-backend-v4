import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Novedad } from './novedad.entity';
import { Licencia } from '../licencias/licencia.entity';
import { MiLicencia } from '../mi_licencia/milicencia.entity';
import { NovedadService } from './novedad.service';
import { NovedadController } from './novedad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad, Licencia, MiLicencia])],
  providers: [NovedadService],
  controllers: [NovedadController],
})
export class NovedadModule {}