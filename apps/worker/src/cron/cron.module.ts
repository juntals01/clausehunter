import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '@clausehunter/database';
import { EmailAlertsService } from './email-alerts.service';
import { ServicesModule } from '../services/services.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract]),
        ServicesModule,
    ],
    providers: [EmailAlertsService],
})
export class CronModule { }
