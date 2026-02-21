import { BadRequestException, Injectable } from '@nestjs/common';
import { Novedad } from './novedad.entity';
import { Licencia } from 'src/licencias/licencia.entity';
import { MiLicencia } from 'src/mi_licencia/milicencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';


@Injectable()
export class NovedadService {
  constructor(
    @InjectRepository(Novedad)
    private readonly repo: Repository<Novedad>,
    @InjectRepository(Licencia)
    private readonly licenciaRepo: Repository<Licencia>,
    @InjectRepository(MiLicencia)
    private readonly miLicenciaRepo: Repository<MiLicencia>,
    private readonly dataSource: DataSource,
  ) { }
  
  async findAll() {
    // Usar find() con relaciones específicas, sin el campo 'archivo' que es bytea
    return await this.repo.find({
      relations: ['miLicencia', 'miLicencia.user', 'miLicencia.tipo', 'servicio', 'licencia'],
      order: { fechaSistema: 'DESC' },
    });
  }
  async createNovedad(
    referenciaId: string,
    accion: string,
    tipo: string,
  ) {
    console.log('createNovedad params:', { referenciaId, accion, tipo });
    const data: any = { accion };

    if (tipo && tipo.toUpperCase() === 'LICENCIA') {
      // Intentar primero en mi_licencia (licencias creadas por /milicencias)
      const miLicenciaObj = await this.miLicenciaRepo.findOne({ where: { id: referenciaId } });
      if (miLicenciaObj) {
        data.miLicencia = miLicenciaObj;
      } else {
        // Fallback a Licencia (licencias creadas por /licencias)
        const licenciaObj = await this.licenciaRepo.findOne({ where: { id: referenciaId } });
        if (!licenciaObj) {
          throw new BadRequestException('Licencia no encontrada para novedad');
        }
        data.licencia = licenciaObj;
      }
    } else if (tipo && tipo.toUpperCase() === 'SERVICIO') {
      data.servicio = referenciaId; // Si necesitas, busca el objeto Servicio igual que Licencia
    } else {
      console.error('Tipo inválido para novedad:', tipo);
      throw new BadRequestException('Tipo inválido para novedad');
    }
    console.log('data a guardar en novedad:', data);
    const novedad = this.repo.create(data);
    return this.repo.save(novedad);
  }


}