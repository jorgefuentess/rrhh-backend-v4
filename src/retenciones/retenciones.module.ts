import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novedad } from '../novedades_del_mes/novedad.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { User } from '../users/user.entity';
import { RetencionBoleta } from './retencion-boleta.entity';
import { Retencion } from './retencion.entity';
import { RetencionesController } from './retenciones.controller';
import { RetencionesService } from './retenciones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Retencion,
      RetencionBoleta,
      User,
      NoDocente,
      Novedad,
    ]),
  ],
  controllers: [RetencionesController],
  providers: [RetencionesService],
  exports: [RetencionesService],
})
export class RetencionesModule {}
