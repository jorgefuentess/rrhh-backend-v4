import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { EstructuraCurricular } from './estructura_curricular.entity';
import { UpdateEstructuraCurricularDto } from './dto/update-estructura-curricular.dto';

@Injectable()
export class EstructuraCurricularService {
  constructor(
    @InjectRepository(EstructuraCurricular)
    private readonly repo: Repository<EstructuraCurricular>,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repo.find({
      where: { activo: true },
      order: { nivel: 'ASC', turno: 'ASC', seccion: 'ASC', materia: 'ASC' },
    });
  }

  async findNiveles(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('ec')
      .select('DISTINCT ec.nivel', 'nivel')
      .where('ec.activo = true')
      .orderBy('ec.nivel', 'ASC')
      .getRawMany<{ nivel: string }>();

    return rows.map((r) => r.nivel);
  }

  async findTurnosByNivel(nivel: string): Promise<string[]> {
    if (!nivel?.trim()) throw new BadRequestException('nivel es requerido');

    const rows = await this.repo
      .createQueryBuilder('ec')
      .select('DISTINCT ec.turno', 'turno')
      .where('ec.activo = true')
      .andWhere('LOWER(ec.nivel) = LOWER(:nivel)', { nivel: nivel.trim() })
      .orderBy('ec.turno', 'ASC')
      .getRawMany<{ turno: string }>();

    return rows.map((r) => r.turno);
  }

  async findSecciones(nivel: string, turno: string): Promise<string[]> {
    if (!nivel?.trim() || !turno?.trim()) {
      throw new BadRequestException('nivel y turno son requeridos');
    }

    const rows = await this.repo
      .createQueryBuilder('ec')
      .select('DISTINCT ec.seccion', 'seccion')
      .where('ec.activo = true')
      .andWhere('LOWER(ec.nivel) = LOWER(:nivel)', { nivel: nivel.trim() })
      .andWhere('LOWER(ec.turno) = LOWER(:turno)', { turno: turno.trim() })
      .orderBy('ec.seccion', 'ASC')
      .getRawMany<{ seccion: string }>();

    return rows.map((r) => r.seccion);
  }

  async findMaterias(nivel: string, turno: string, seccion: string) {
    if (!nivel?.trim() || !turno?.trim() || !seccion?.trim()) {
      throw new BadRequestException('nivel, turno y seccion son requeridos');
    }

    return this.repo.find({
      where: {
        activo: true,
        nivel: nivel.trim(),
        turno: turno.trim(),
        seccion: seccion.trim(),
      },
      order: { materia: 'ASC' },
    });
  }

  async update(id: string, data: UpdateEstructuraCurricularDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Registro no encontrado');

    if (data.nivel !== undefined) row.nivel = data.nivel.trim();
    if (data.turno !== undefined) row.turno = data.turno.trim();
    if (data.seccion !== undefined) row.seccion = data.seccion.trim();
    if (data.materia !== undefined) row.materia = data.materia.trim();
    if (data.horas !== undefined) row.horas = Number(data.horas);
    if (data.tipoMateria !== undefined) row.tipoMateria = data.tipoMateria.trim();
    if (data.condicion !== undefined) row.condicion = data.condicion.trim();

    return this.repo.save(row);
  }

  async remove(id: string) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Registro no encontrado');

    await this.repo.delete(id);
    return { ok: true };
  }

  async importExcelReplaceAll(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const targetSheetName = workbook.SheetNames.find(
      (n) => n.trim().toLowerCase() === 'tabla estructura curricular',
    );

    if (!targetSheetName) {
      throw new BadRequestException('No se encontró la hoja "Tabla Estructura Curricular"');
    }

    const sheet = workbook.Sheets[targetSheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false,
    });

    if (!rows.length) {
      throw new BadRequestException('El Excel no contiene filas para importar');
    }

    const parsed: Array<Partial<EstructuraCurricular>> = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const line = index + 2;

      const nivel = String(row['Nivel'] ?? '').trim();
      const turno = String(row['Turno'] ?? '').trim();
      const seccion = String(row['Seccion'] ?? '').trim();
      const materia = String(row['Materia'] ?? '').trim();
      const horasRaw = row['Hs.'];
      const tipoMateria = String(row['Tipo'] ?? '').trim();
      const condicion = String(row['Condicion'] ?? '').trim();

      const isCompletelyEmpty =
        !nivel && !turno && !seccion && !materia && !String(horasRaw ?? '').trim() && !tipoMateria && !condicion;
      if (isCompletelyEmpty) return;

      if (!nivel || !turno || !seccion || !materia || !tipoMateria || !condicion) {
        errors.push(`Fila ${line}: faltan columnas obligatorias`);
        return;
      }

      const horas = Number(horasRaw);
      if (!Number.isFinite(horas) || horas < 0) {
        errors.push(`Fila ${line}: Hs. inválida`);
        return;
      }

      parsed.push({
        nivel,
        turno,
        seccion,
        materia,
        horas,
        tipoMateria,
        condicion,
        activo: true,
      });
    });

    if (!parsed.length) {
      throw new BadRequestException('No hay filas válidas para importar');
    }

    if (errors.length) {
      throw new BadRequestException({
        message: 'Importación cancelada. Corrige el Excel y vuelve a intentar.',
        errors,
      });
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.createQueryBuilder().delete().from(EstructuraCurricular).execute();
        await manager.save(EstructuraCurricular, parsed);
      });
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Importación cancelada por error de datos (revisar duplicados)',
        detail: error?.message,
      });
    }

    return {
      ok: true,
      message: 'Importación completada con reemplazo total',
      total: parsed.length,
    };
  }
}
