import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContractsController } from './contracts.controller';
import { AdminContractsController } from './admin-contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract } from '@clausehunter/database';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract]),
        BullModule.registerQueue({ name: 'contract-ocr' }),
        MulterModule.register({
            storage: memoryStorage(), // Use memory storage since we're uploading to MinIO
            fileFilter: (req, file, cb) => {
                if (file.mimetype === 'application/pdf') {
                    cb(null, true);
                } else {
                    cb(new Error('Only PDF files are allowed'), false);
                }
            },
        }),
        StorageModule,
    ],
    controllers: [ContractsController, AdminContractsController],
    providers: [ContractsService],
})
export class ContractsModule { }
