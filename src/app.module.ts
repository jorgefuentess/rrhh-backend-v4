import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthUsersModule } from './auth_users/auth_users.module';
import { UsersModule } from './users/users.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { LicenciasModule } from './licencias/licencias.module';
import { ServiciosModule } from './servicios/servicios.module';
import { DDJJModule } from './ddjj/ddjj.module';
import { ConfigModule } from '@nestjs/config';
import { MiLicenciasModule } from './mi_licencia/milicencias.module';
import { TipoLicenciaModule } from './tipo_licencia/tipo_licencia.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    AuthUsersModule,
    UsersModule,
    CatalogosModule,
    LicenciasModule,
    ServiciosModule,
    DDJJModule, 
    MiLicenciasModule,
    TipoLicenciaModule
  ],
})
export class AppModule {}