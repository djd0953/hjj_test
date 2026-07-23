import { AwsModule } from "@lib/aws/aws.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GameModule } from "@module/game/game.module";
import { HsadModule } from "@module/hsad/hsad.module";
import { CodeModule } from "@module/code/code.module";
import { WsModule } from "@module/ws/ws.module";
import { NotificationModule } from "@module/notification/notification.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        }),

        CodeModule,
        AwsModule,
        GameModule,
        WsModule,
        HsadModule,
        NotificationModule
    ],
    providers: []
})
export class AppModule {}
