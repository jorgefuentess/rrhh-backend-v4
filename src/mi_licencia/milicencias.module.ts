import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MiLicencia } from './milicencia.entity';
import { MiLicenciasService } from './milicencias.service';
import { MiLicenciasController } from './milicencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MiLicencia])],
  providers: [MiLicenciasService],
  controllers: [MiLicenciasController],
})
export class MiLicenciasModule {}