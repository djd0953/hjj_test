import { AwsModule } from '@lib/aws/aws.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from '@module/game/game.module';

@Module({
    imports:
    [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        }),

        AwsModule,
        GameModule
    ],
    providers: []
})
export class AppModule {}
