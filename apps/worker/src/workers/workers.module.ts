import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract, ContractText, Notification, User } from '@expirationreminderai/database';
import { ServicesModule } from '../services/services.module';
import { QueueModule } from '../queue/queue.module';
import { OcrProcessor } from '../queue/ocr.processor';
import { ExtractProcessor } from '../queue/extract.processor';
import { EmailProcessor } from '../queue/email.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract, ContractText, Notification, User]),
        ServicesModule,
        QueueModule,
    ],
    providers: [
        OcrProcessor,
        ExtractProcessor,
        EmailProcessor,
    ],
})
export class WorkersModule { }
