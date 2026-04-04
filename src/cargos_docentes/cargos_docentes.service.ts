import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { CargoDocente } from 'src/cargos_docentes/cargo_docente.entity';

@Injectable()
export class CargosDocentesService {
  constructor(
    @InjectRepository(CargoDocente)
    private readonly repo: Repository<CargoDocente>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(nivel?: string, schoolId?: string) {
    const qb = this.repo
      .createQueryBuilder('cd')
      .where('cd.activo = true')
      .orderBy('cd.nivel', 'ASC')
      .addOrderBy('cd.cargo', 'ASC');

    if (nivel?.trim()) {
      qb.andWhere('LOWER(cd.nivel) = LOWER(:nivel)', { nivel: nivel.trim() });
    }
    if (schoolId) {
      qb.andWhere('cd.schoolId = :schoolId', { schoolId });
    }

    return qb.getMany();
  }

  async findNiveles(schoolId?: string): Promise<string[]> {
    const qb = this.repo
      .createQueryBuilder('cd')
      .select('DISTINCT cd.nivel', 'nivel')
      .where('cd.activo = true')
      .orderBy('cd.nivel', 'ASC');
    if (schoolId) qb.andWhere('cd.schoolId = :schoolId', { schoolId });
    const rows = await qb.getRawMany<{ nivel: string }>();
    return rows.map((r) => r.nivel);
  }

  private toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined) return Number.NaN;

    const normalized = String(value).trim().replace(',', '.');
    return Number(normalized);
  }

  async importExcelReplaceAll(file: Express.Multer.File, schoolId?: string) {
    if (!file) throw new BadRequestException('Archivo requerido');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const targetSheetName = workbook.SheetNames.find(
      (n) => n.trim().toLowerCase() === 'tabla cargos docentes',
    );

    if (!targetSheetName) {
      throw new BadRequestException('No se encontró la hoja "Tabla Cargos Docentes"');
    }

    const sheet = workbook.Sheets[targetSheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false,
    });

    if (!rows.length) {
      throw new BadRequestException('El Excel no contiene filas para importar');
    }

    const parsed: Array<Partial<CargoDocente>> = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const line = index + 2;
      const nivel = String(row['Nivel'] ?? '').trim();
      const cargo = String(row['Cargo'] ?? '').trim();
      const codigo = this.toNumber(row['Cod.']);
      const puntos = this.toNumber(row['Puntos']);
      const horas = this.toNumber(row['Horas']);

      const isCompletelyEmpty =
        !nivel && !cargo && !String(row['Cod.'] ?? '').trim() && !String(row['Puntos'] ?? '').trim() && !String(row['Horas'] ?? '').trim();
      if (isCompletelyEmpty) return;

      if (!nivel || !cargo) {
        errors.push(`Fila ${line}: faltan Nivel o Cargo`);
        return;
      }

      if (!Number.isFinite(codigo) || !Number.isInteger(codigo)) {
        errors.push(`Fila ${line}: Cod. inválido`);
        return;
      }

      if (!Number.isFinite(puntos) || puntos < 0) {
        errors.push(`Fila ${line}: Puntos inválido`);
        return;
      }

      if (!Number.isFinite(horas) || horas < 0) {
        errors.push(`Fila ${line}: Horas inválida`);
        return;
      }

      parsed.push({
        nivel,
        cargo,
        codigo,
        puntos,
        horas,
        activo: true,
        schoolId,
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
        const qb = manager.createQueryBuilder().delete().from(CargoDocente);
        if (schoolId) {
          qb.where('schoolId = :schoolId', { schoolId });
        }
        await qb.execute();
        await manager.save(CargoDocente, parsed);
      });
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Importación cancelada por error de datos (revisar duplicados)',
        detail: error?.message,
      });
    }

    return {
      ok: true,
      message: 'Importación de cargos completada con reemplazo total',
      total: parsed.length,
    };
  }
}
