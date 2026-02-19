import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Contract } from './entities/contract.entity';
import { ContractText } from './entities/contract-text.entity';
import { Feedback } from './entities/feedback.entity';
import { Notification } from './entities/notification.entity';
import { Subscription } from './entities/subscription.entity';

config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'expirationreminderai',
    password: process.env.DATABASE_PASSWORD || 'expirationreminderai',
    database: process.env.DATABASE_NAME || 'expirationreminderai',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Contract, ContractText, Feedback, Notification, Subscription],
    migrations: ['src/migrations/*.ts'],
    subscribers: [],
});
