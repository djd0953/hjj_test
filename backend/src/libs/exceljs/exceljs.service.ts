import { Injectable } from '@nestjs/common';
import { ExcelExportInput, HeaderRow } from './exceljs.dto';
import ExcelJS from 'exceljs';

@Injectable()
export class ExcelJsService {
    constructor() {}

    private readonly RESPONSE_HEADERS = (fileName: string) => {
        const ascii = this.sanitizeAsciiFilename(fileName);
        const utf8 = encodeURIComponent(`${fileName}.xlsx`);

        return {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${ascii}.xlsx"; filename*=UTF-8''${utf8}`
        };
    };

    private sanitizeAsciiFilename(name: string) {
    // 헤더 안전 + ASCII로만 구성 (브라우저 fallback용)
        return (
            name
                .replace(/[\r\n"]/g, '') // 줄바꿈/따옴표 제거
                .replace(/[\\/:*?<>|]/g, '_') // 파일명 금지문자
                .replace(/[^\x20-\x7E]/g, '_') // ASCII 이외는 _
                .trim() || 'download'
        );
    }

    async toXlsxBuffer<H extends readonly string[]>(
        fileName: string,
        input: ExcelExportInput<H>
    ): Promise<{ headers: Record<string, string>; data: Buffer }> {
        const { headers, items, sheetName = 'Sheet1' } = input;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);

        // 헤더 포함 각 컬럼의 최대 문자열 길이로 width 계산
        const colWidths = Object.fromEntries(headers.map((h) => [h, h.length]));
        for (const item of items) {
            for (const h of headers) {
                const val = item[h];
                const len = val && typeof val === 'string' ? String(val).length : 0;
                if (len > colWidths[h]) colWidths[h] = len;
            }
        }

        sheet.columns = headers.map((h) => (
            {
                header: h,
                key: h,
                width: Math.min(Math.max(colWidths[h] + 2, 10), 60)
            }
        ));

        for (const item of items) {
            const row = Object.fromEntries(headers.map((h) => [h, item[h] ?? null])) as HeaderRow<H>;

            sheet.addRow(row);
        }

        const arrayBuffer = await workbook.xlsx.writeBuffer();

        const responseHeader = this.RESPONSE_HEADERS(fileName);

        return { headers: responseHeader, data: Buffer.from(arrayBuffer) };
    }
}
