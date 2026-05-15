import type { CellValue } from 'exceljs';

export class ExcelExportInput<H extends readonly string[]> {
    headers: H;
    items: Array<Record<string, CellValue>>;
    sheetName?: string;
};

export type HeaderRow<H extends readonly string[]> = Partial<Record<H[number], CellValue>>;
