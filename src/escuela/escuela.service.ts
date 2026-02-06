import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escuela } from './escuela.entity';


@Injectable()
export class EscuelaService {
  constructor(@InjectRepository(Escuela) private repo: Repository<Escuela>) {}

  findAll() { return this.repo.find(); }
  create(data: any) { const e = this.repo.create(data); return this.repo.save(e); }
}