import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkersModule } from './workers/workers.module';
import { ServicesModule } from './services/services.module';
import { CronModule } from './cron/cron.module';
import { User, Contract, ContractText, Feedback, Notification, Subscription } from '@expirationreminderai/database';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DATABASE_HOST', 'localhost'),
                port: config.get('DATABASE_PORT', 5432),
                username: config.get('DATABASE_USER', 'expirationreminderai'),
                password: config.get('DATABASE_PASSWORD', 'expirationreminderai'),
                database: config.get('DATABASE_NAME', 'expirationreminderai'),
                entities: [User, Contract, ContractText, Feedback, Notification, Subscription],
                synchronize: false,
                logging: config.get('NODE_ENV') === 'development',
            }),
        }),
        ServicesModule,
        WorkersModule,
        CronModule,
    ],
})
export class AppModule {}
