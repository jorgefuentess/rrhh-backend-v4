import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nivel } from './nivel.entity';
import { Seccion } from './seccion.entity';
import { Materia } from './materia.entity';
import { CatalogosService } from './catalogos.service';
import { CatalogosController } from './catalogos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nivel, Seccion, Materia])],
  providers: [CatalogosService],
  controllers: [CatalogosController],
  exports: [TypeOrmModule, CatalogosService],
})
export class CatalogosModule {}