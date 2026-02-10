import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Novedad } from './novedad.entity';
import { NovedadService } from './novedad.service';
import { NovedadController } from './novedad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad])],
  providers: [NovedadService],
  controllers: [NovedadController],
})
export class NovedadModule {}