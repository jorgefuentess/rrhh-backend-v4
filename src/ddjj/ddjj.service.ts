import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DDJJ } from './ddjj.entity';
import { CreateDDJJDto } from './dto/create-ddjj.dto';
import { User } from '../users/user.entity';
import { Servicio } from '../servicios/servicio.entity';

@Injectable()
export class DDJJService {
  constructor(
    @InjectRepository(DDJJ) private repo: Repository<DDJJ>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Servicio) private serviciosRepo: Repository<Servicio>,
  ) {}

  findAll(): Promise<DDJJ[]> {
    return this.repo.find();
  }

  findByPersona(userId: string): Promise<DDJJ[]> {
    return this.repo.find({ where: { user: { id: userId } } });
  }

  async create(data: CreateDDJJDto): Promise<DDJJ> {
    // 1) Validar persona
    const user = await this.userRepo.findOne({ where: { id: data.personaId } });
    if (!user) throw new NotFoundException('Persona no encontrada');

    // 2) Calcular horas/cargos en el COLEGIO desde servicios
    //    (suma de cantHs de todos los servicios del usuario)
    const result = await this.serviciosRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.cantHs), 0)', 'sum')
      .where('s.userId = :uid', { uid: user.id })
      .getRawOne<{ sum: string }>();

    const cargosHsColegio = parseInt(result?.sum ?? '0', 10);

    // 3) Preparar y guardar
    const ddjj = this.repo.create({
      user,
      cargosHsColegio,
      cargosHsPrivados: data.cargosHsPrivados ?? 0,
      cargosHsPublicos: data.cargosHsPublicos ?? 0,
    });

    return this.repo.save(ddjj);
  }
}
