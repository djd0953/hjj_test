import { Injectable, Logger } from "@nestjs/common";
import { CodeKeywords } from "../constants/code.constant";
import { CodeResultServiceDto } from "../dto/code.dto";
import * as codes from "./codes";
import { S3Service } from "@lib/aws/services/s3.service";
import { KmsService } from "@lib/aws/services/kms.service";
import { SMService } from "@lib/aws/services/sm.service";

@Injectable()
export class CodeService {
    private readonly logger = new Logger(CodeService.name);
    constructor(
        private readonly s3Service: S3Service,
        private readonly kmsService: KmsService,
        private readonly smService: SMService
    ) {}

    getList() {
        return CodeKeywords;
    }

    async getCodeResult(dto: CodeResultServiceDto) {
        if (dto.type && dto.type.startsWith("b")) this.logger.verbose("Brack Point");

        switch (dto.keyword) {
            case "aws":
                return await codes.awsDownload(this.s3Service);

            case "cleanDocx":
                return await codes.cleanDocx();

            case "diffDocx":
                return await codes.diffDocx();

            case "effectiveDate":
                return await codes.effectiveDate();

            case "email":
                return await codes.email(this.s3Service);

            case "excelFileCheck":
                return await codes.excelFileCheck();

            case "excelWritingBulkChk":
                return await codes.excelWritingBulkChk();

            case "fixDocx":
                return await codes.fixDocx();

            case "jwt":
                return codes.jwtVerify();

            case "kms":
                return await codes.kmsTest(this.kmsService);

            case "lcs":
                return codes.lcs();

            case "organization":
                return codes.organization();

            case "separateCode":
                return codes.separateCode();

            case "sm":
                return await codes.smTest(this.smService);

            case "templateDataParse":
                return codes.templateDataParse();

            case "uaparse":
                return codes.uaparse();

            case "uuid":
                return codes.uuid();

            case "woffToTtf":
                return await codes.woffToTtf();

            default:
                return null;
        }
    }
}
