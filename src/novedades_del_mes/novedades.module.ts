import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Novedad } from './novedad.entity';
import { NovedadesService } from './novedades.service';
import { NovedadesController } from './novedades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad])],
  providers: [NovedadesService],
  controllers: [NovedadesController],
})
export class LicenciasModule {}