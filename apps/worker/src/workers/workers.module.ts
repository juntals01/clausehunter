import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract, ContractText } from '@clausehunter/database';
import { OcrWorker } from './ocr.worker';
import { ExtractWorker } from './extract.worker';
import { ServicesModule } from '../services/services.module';
import { ConductorModule } from '../conductor/conductor.module';
import { QueueModule } from '../queue/queue.module';
import { OcrProcessor } from '../queue/ocr.processor';
import { ExtractProcessor } from '../queue/extract.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract, ContractText]),
        ServicesModule,
        ConductorModule,
        QueueModule,
    ],
    providers: [
        OcrWorker,
        ExtractWorker,
        OcrProcessor,
        ExtractProcessor,
    ],
})
export class WorkersModule { }
