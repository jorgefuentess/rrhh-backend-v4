import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licencia } from './licencia.entity';
import { LicenciasService } from './licencias.service';
import { LicenciasController } from './licencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Licencia])],
  providers: [LicenciasService],
  controllers: [LicenciasController],
})
export class LicenciasModule {}