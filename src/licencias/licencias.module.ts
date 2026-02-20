import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licencia } from './licencia.entity';
import { LicenciasService } from './licencias.service';
import { LicenciasController } from './licencias.controller';
import { Novedad } from 'src/novedades_del_mes/novedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Licencia, Novedad])],
  providers: [LicenciasService],
  controllers: [LicenciasController],
})
export class LicenciasModule {}