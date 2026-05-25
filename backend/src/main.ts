import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
        maxAge: 86400,
        credentials: true
    });
    app.use(cookieParser());
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));

    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(process.env.PORT ?? 9090);
}

void bootstrap();
