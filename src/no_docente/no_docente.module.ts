import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoDocente } from './no_docente.entity';
import { NoDocenteService } from './no_docente.service';
import { NoDocenteController } from './no_docente.controller';


@Module({
  imports: [TypeOrmModule.forFeature([NoDocente])],
  providers: [NoDocenteService],
  controllers: [NoDocenteController]
})
export class NoDocenteModule {}