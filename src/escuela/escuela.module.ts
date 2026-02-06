import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Escuela } from './escuela.entity';
import { EscuelaService } from './escuela.service';
import { EscuelaController } from './escuela.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela])],
  providers: [EscuelaService],
  controllers: [EscuelaController],
})
export class EscuelaModule {}