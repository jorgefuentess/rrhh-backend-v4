import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoDocente } from './cargo_docente.entity';
import { CargosDocentesService } from './cargos_docentes.service';
import { CargosDocentesController } from './cargos_docentes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CargoDocente])],
  providers: [CargosDocentesService],
  controllers: [CargosDocentesController],
  exports: [CargosDocentesService],
})
export class CargosDocentesModule {}
