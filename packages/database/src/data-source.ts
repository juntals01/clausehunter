import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Contract } from './entities/contract.entity';
import { ContractText } from './entities/contract-text.entity';

config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'clausehunter',
    password: process.env.DATABASE_PASSWORD || 'clausehunter',
    database: process.env.DATABASE_NAME || 'clausehunter',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Contract, ContractText],
    migrations: ['src/migrations/*.ts'],
    subscribers: [],
});
