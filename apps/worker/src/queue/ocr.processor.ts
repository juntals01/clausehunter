import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { Contract, ContractText } from '@clausehunter/database';
import { OcrService } from '../services/ocr.service';
import { StorageService } from '../services/storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Processor('contract-ocr', {
    concurrency: 1,
})
export class OcrProcessor extends WorkerHost {
    constructor(
        private ocrService: OcrService,
        private storageService: StorageService,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
    ) {
        super();
    }

    async process(job: Job<{ contractId: string; fileName: string }>): Promise<any> {
        const { contractId, fileName } = job.data;

        console.log(`[BullMQ OCR] Processing contract ${contractId}, file: ${fileName}...`);

        const tempPath = path.join('/tmp', fileName);

        try {
            // Update status to processing
            await this.contractRepository.update(contractId, { status: 'processing' });

            // Download file from MinIO
            const fileBuffer = await this.storageService.downloadFile(fileName);

            // Save temp file for Tesseract
            await fs.writeFile(tempPath, fileBuffer);

            // Extract text using OCR
            const fullText = await this.ocrService.extractTextFromPdf(tempPath);

            // Clean up temp file
            try { await fs.unlink(tempPath); } catch (e) { }

            // Save extracted text
            const contractText = this.contractTextRepository.create({
                contractId,
                fullText,
            });
            await this.contractTextRepository.save(contractText);

            console.log(`[BullMQ OCR] Text extracted for contract ${contractId}`);

            return { contractId, success: true };
        } catch (error) {
            console.error(`[BullMQ OCR] Error processing contract ${contractId}:`, error);

            // Clean up temp file on error
            try { await fs.unlink(tempPath); } catch (e) { }

            await this.contractRepository.update(contractId, {
                status: 'failed',
                errorMessage: error.message || 'OCR processing failed',
            });

            // Don't throw - mark as failed and complete the job
            return { contractId, success: false, error: error.message };
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`[BullMQ OCR] Job ${job.id} completed for contract ${job.data.contractId}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        console.error(`[BullMQ OCR] Job ${job.id} failed:`, error.message);
    }
}
