import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Licencia } from './licencia.entity';
import { Novedad } from '../novedades_del_mes/novedad.entity';

@Injectable()
export class LicenciasService {
  constructor(
    @InjectRepository(Licencia) private repo: Repository<Licencia>,
    private readonly dataSource: DataSource,
  ) { }

  findAll() { return this.repo.find(); }

  async create(data: any) {
    return this.dataSource.transaction(async (manager) => {
      const licenciaRepo = manager.getRepository(Licencia);
      const novedadRepo = manager.getRepository(Novedad);

      const licencia = licenciaRepo.create(data);
      const saved = await licenciaRepo.save(licencia);
      const savedList = Array.isArray(saved) ? saved : [saved];

      console.log('Licencia guardada:', savedList.map((l) => l?.id));

      for (const licenciaGuard of savedList) {
        if (!licenciaGuard || !licenciaGuard.id) {
          continue;
        }
        const novedad = novedadRepo.create({
          accion: 'alta',
          licencia: licenciaGuard,
        });
        await novedadRepo.save(novedad);

        console.log('Novedad creada para licencia:', licenciaGuard.id);
      }

      return saved;
    });
  }
}