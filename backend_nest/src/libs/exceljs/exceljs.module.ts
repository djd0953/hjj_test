import { Module } from '@nestjs/common';
import { ExcelJsService } from './exceljs.service';

@Module({
    providers: [ExcelJsService],
    exports: [ExcelJsService]
})
export class ExcelJsModule {}
