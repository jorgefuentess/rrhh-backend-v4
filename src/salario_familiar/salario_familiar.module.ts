import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novedad } from '../novedades_del_mes/novedad.entity';
import { NoDocente } from '../no_docente/no_docente.entity';
import { User } from '../users/user.entity';
import { SalarioFamiliarController } from './salario_familiar.controller';
import { SalarioFamiliarConyuge } from './salario_familiar_conyuge.entity';
import { SalarioFamiliarHijo } from './salario_familiar_hijo.entity';
import { SalarioFamiliarPago } from './salario_familiar_pago.entity';
import { SalarioFamiliar } from './salario_familiar.entity';
import { SalarioFamiliarService } from './salario_familiar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalarioFamiliar,
      SalarioFamiliarConyuge,
      SalarioFamiliarHijo,
      SalarioFamiliarPago,
      User,
      NoDocente,
      Novedad,
    ]),
  ],
  controllers: [SalarioFamiliarController],
  providers: [SalarioFamiliarService],
  exports: [SalarioFamiliarService],
})
export class SalarioFamiliarModule {}