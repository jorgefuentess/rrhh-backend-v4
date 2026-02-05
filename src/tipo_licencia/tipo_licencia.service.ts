import { Injectable } from '@nestjs/common';
import { TipoLicencia } from './tipo_licencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TipoLicenciaService {

    constructor(@InjectRepository(TipoLicencia) private repo: Repository<TipoLicencia>) { }

    findAll() { return this.repo.find(); }


}