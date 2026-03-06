import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import AdmZip from 'adm-zip';

import { ReciboSueldo } from './recibo_sueldo.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReciboSueldoService {
  private uploadDir = path.join(process.cwd(), 'uploads', 'recibos');

  constructor(
    @InjectRepository(ReciboSueldo)
    private readonly repo: Repository<ReciboSueldo>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findAll(filters?: { docenteId?: string; anio?: number; mes?: number }) {
    const where: any = {};
    if (filters?.docenteId) {
      where.docente = { id: filters.docenteId };
    }
    if (filters?.anio) where.anio = filters.anio;
    if (filters?.mes) where.mes = filters.mes;

    return this.repo.find({ where, order: { fechaCarga: 'DESC' } });
  }

  async findByDocente(docenteId: string, anio?: number, mes?: number) {
    const where: any = { docente: { id: docenteId } };
    if (anio) where.anio = anio;
    if (mes) where.mes = mes;
    return this.repo.find({ where, order: { anio: 'DESC', mes: 'DESC' } });
  }

  async getById(id: string) {
    const recibo = await this.repo.findOne({ where: { id } });
    if (!recibo) throw new NotFoundException('Recibo no encontrado');
    return recibo;
  }

  async create(docenteId: string, anio: number, mes: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    return this.createFromBuffer(docenteId, anio, mes, file.originalname, file.buffer);
  }

  private async createFromBuffer(
    docenteId: string,
    anio: number,
    mes: number,
    originalName: string,
    buffer: Buffer,
  ) {
    const docente = await this.userRepo.findOne({ where: { id: docenteId } });
    if (!docente) throw new NotFoundException('Docente no encontrado');

    const filename = `${docenteId}_${anio}_${mes}_${Date.now()}_${originalName}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    const recibo = this.repo.create({
      docente,
      anio,
      mes,
      archivoNombre: originalName,
      archivoRuta: filepath,
    });

    return this.repo.save(recibo);
  }

  async createMany(docenteId: string, items: Array<{ anio: number; mes: number; file: Express.Multer.File }>) {
    const results = [];
    for (const item of items) {
      results.push(await this.create(docenteId, item.anio, item.mes, item.file));
    }
    return results;
  }

  async createFromZip(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo ZIP requerido');

    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();

    const results: any[] = [];
    const errors: any[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const name = entry.entryName.split('/').pop() || '';
      const lower = name.toLowerCase();
      if (!lower.endsWith('.pdf')) {
        continue;
      }

      // formato esperado: dni_anio_mes.pdf
      const base = name.replace(/\.pdf$/i, '');
      const parts = base.split('_');

      if (parts.length < 3) {
        errors.push({ file: name, error: 'Formato inválido (dni_anio_mes.pdf)' });
        continue;
      }

      const dni = parts[0];
      const anio = Number(parts[1]);
      const mes = Number(parts[2]);

      if (!dni || !anio || !mes) {
        errors.push({ file: name, error: 'Datos incompletos en nombre' });
        continue;
      }

      const docente = await this.userRepo.findOne({ where: { dni } });
      if (!docente) {
        errors.push({ file: name, error: `Docente no encontrado para DNI ${dni}` });
        continue;
      }

      try {
        const buffer = entry.getData();
        const saved = await this.createFromBuffer(
          docente.id,
          anio,
          mes,
          name,
          buffer,
        );
        results.push(saved);
      } catch (err: any) {
        errors.push({ file: name, error: err?.message || 'Error al guardar' });
      }
    }

    return { total: results.length, results, errors };
  }

  async updateConformidad(reciboId: string, conformidad: 'conforme' | 'no_conforme', observacion?: string) {
    const recibo = await this.repo.findOne({ where: { id: reciboId } });
    if (!recibo) throw new NotFoundException('Recibo no encontrado');

    recibo.conformidad = conformidad;
    recibo.observacion = conformidad === 'no_conforme' ? observacion : null;
    recibo.fechaConformidad = new Date();
    return this.repo.save(recibo);
  }

  async getFile(reciboId: string) {
    const recibo = await this.repo.findOne({ where: { id: reciboId } });
    if (!recibo) throw new NotFoundException('Recibo no encontrado');

    if (!fs.existsSync(recibo.archivoRuta)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return recibo;
  }
}
