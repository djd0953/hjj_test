import { AwsModule } from "@lib/aws/aws.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GameModule } from "@module/game/game.module";
import { HsadModule } from "@module/hsad/hsad.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        }),

        AwsModule,
        GameModule,
        HsadModule
    ],
    providers: []
})
export class AppModule {}
