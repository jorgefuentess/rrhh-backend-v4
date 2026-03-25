import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstructuraCurricular } from 'src/estructura_curricular/estructura_curricular.entity';
import { EstructuraCurricularService } from 'src/estructura_curricular/estructura_curricular.service';
import { EstructuraCurricularController } from 'src/estructura_curricular/estructura_curricular.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstructuraCurricular])],
  providers: [EstructuraCurricularService],
  controllers: [EstructuraCurricularController],
  exports: [EstructuraCurricularService],
})
export class EstructuraCurricularModule {}
