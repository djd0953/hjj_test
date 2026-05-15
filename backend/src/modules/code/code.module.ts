import { Module } from "@nestjs/common";
import { CodeService } from "./services/code.service";
import { CodeController } from "./controllers/code.controller";
import { AwsModule } from "@lib/aws/aws.module";

@Module({
    imports: [AwsModule],
    controllers: [CodeController],
    providers: [CodeService],
    exports: [CodeService]
})
export class CodeModule {}
