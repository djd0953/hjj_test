import { Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { SqsService } from './services/sqs.service';
import { KmsService } from './services/kms.service';
import { OpenSearchService } from './services/opensearch.service';
import { ConfigModule } from '@nestjs/config';
import { SMService } from './services/sm.service';

@Module({
    imports: [ConfigModule],
    providers: 
    [
        SMService, 
        S3Service, 
        SqsService, 
        KmsService, 
        OpenSearchService
    ],
    exports: 
    [
        SMService, 
        S3Service, 
        SqsService, 
        KmsService, 
        OpenSearchService
    ]
})
export class AwsModule {}
