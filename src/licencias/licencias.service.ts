import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Licencia } from './licencia.entity';

@Injectable()
export class LicenciasService {
  constructor(@InjectRepository(Licencia) private repo: Repository<Licencia>,
    private readonly dataSource: DataSource,
  ) { }

  findAll() { return this.repo.find(); }
  create(data: any) { const e = this.repo.create(data); return this.repo.save(e); }

}