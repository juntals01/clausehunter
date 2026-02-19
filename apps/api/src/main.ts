import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });
    const config = app.get(ConfigService);

    // Enable CORS
    app.enableCors();

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = config.get('API_PORT', 3001);
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
