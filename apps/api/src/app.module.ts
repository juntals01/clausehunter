import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsModule } from './contracts/contracts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminEmailModule } from './admin-email/admin-email.module';
import { ContactModule } from './contact/contact.module';
import { BillingModule } from './billing/billing.module';
import { User, Contract, ContractText, Feedback, Notification, Subscription, BlogPost, FeatureRequest, FeatureRequestVote } from '@expirationreminderai/database';
import { BlogModule } from './blog/blog.module';
import { FeatureRequestsModule } from './feature-requests/feature-requests.module';

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
                entities: [User, Contract, ContractText, Feedback, Notification, Subscription, BlogPost, FeatureRequest, FeatureRequestVote],
                synchronize: false,
                logging: config.get('NODE_ENV') === 'development',
            }),
        }),
        StorageModule,
        QueueModule,
        AuthModule,
        UsersModule,
        ContractsModule,
        FeedbackModule,
        NotificationsModule,
        AdminEmailModule,
        ContactModule,
        BillingModule,
        BlogModule,
        FeatureRequestsModule,
    ],
})
export class AppModule {}
