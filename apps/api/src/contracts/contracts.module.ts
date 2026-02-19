import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContractsController } from './contracts.controller';
import { AdminContractsController } from './admin-contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract, ContractText, User } from '@expirationreminderai/database';
import { StorageModule } from '../storage/storage.module';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract, ContractText, User]),
        BullModule.registerQueue(
            { name: 'contract-ocr' },
            { name: 'contract-extract' },
            { name: 'email-send' },
        ),
        MulterModule.register({
            storage: memoryStorage(), // Use memory storage since we're uploading to MinIO
            fileFilter: (req, file, cb) => {
                const allowed = [
                    'application/pdf',
                    'application/msword',                                                        // .doc
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
                ];
                if (allowed.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
                }
            },
        }),
        StorageModule,
        BillingModule,
    ],
    controllers: [ContractsController, AdminContractsController],
    providers: [ContractsService],
})
export class ContractsModule { }
