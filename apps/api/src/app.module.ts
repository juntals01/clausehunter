import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsModule } from './contracts/contracts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { User, Contract, ContractText } from '@clausehunter/database';

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
                username: config.get('DATABASE_USER', 'clausehunter'),
                password: config.get('DATABASE_PASSWORD', 'clausehunter'),
                database: config.get('DATABASE_NAME', 'clausehunter'),
                entities: [User, Contract, ContractText],
                synchronize: false,
                logging: config.get('NODE_ENV') === 'development',
            }),
        }),
        StorageModule,
        QueueModule,
        AuthModule,
        UsersModule,
        ContractsModule,
    ],
})
export class AppModule {}
