import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db')
  async getDbHealth() {
    const result = await this.dataSource.query(
      'SELECT current_database() AS db, inet_server_addr() AS host, inet_server_port() AS port'
    );

    return {
      ok: true,
      db: result?.[0]?.db ?? null,
      host: result?.[0]?.host ?? null,
      port: result?.[0]?.port ?? null,
    };
  }
}
