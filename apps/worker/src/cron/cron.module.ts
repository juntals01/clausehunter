import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Contract } from '@expirationreminderai/database';
import { EmailAlertsService } from './email-alerts.service';
import { ServicesModule } from '../services/services.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract]),
        BullModule.registerQueue({ name: 'email-send' }),
        ServicesModule,
    ],
    providers: [EmailAlertsService],
})
export class CronModule { }
