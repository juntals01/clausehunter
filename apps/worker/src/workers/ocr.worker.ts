import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractText } from '@clausehunter/database';
import { ConductorService } from '../conductor/conductor.service';
import { OcrService } from '../services/ocr.service';
import { StorageService } from '../services/storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class OcrWorker implements OnModuleInit {
    constructor(
        private conductorService: ConductorService,
        private ocrService: OcrService,
        private storageService: StorageService,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
    ) { }

    onModuleInit() {
        this.conductorService.startWorker('contract_ocr', this.execute.bind(this));
    }

    async execute(task: any) {
        const { contractId, fileName } = task.inputData;

        console.log(`[OCR] Processing contract ${contractId} file: ${fileName}...`);

        try {
            // Update status to processing
            await this.contractRepository.update(contractId, { status: 'processing' });

            // Download file from MinIO
            const fileBuffer = await this.storageService.downloadFile(fileName);

            // Save temp file for Tesseract (or refactor OcrService to accept buffer)
            // Assuming OcrService extracts from file path for now as per previous implementation
            const tempPath = path.join('/tmp', fileName);
            await fs.writeFile(tempPath, fileBuffer);

            // Extract text using OCR
            const fullText = await this.ocrService.extractTextFromPdf(tempPath);

            // Clean up temp file
            await fs.unlink(tempPath);

            // Save extracted text
            const contractText = this.contractTextRepository.create({
                contractId,
                fullText,
            });
            await this.contractTextRepository.save(contractText);

            console.log(`[OCR] Text extracted for contract ${contractId}`);

            return { contractId };
        } catch (error) {
            console.error(`[OCR] Error processing contract ${contractId}:`, error);

            await this.contractRepository.update(contractId, {
                status: 'failed',
                errorMessage: error.message,
            });

            throw error;
        }
    }
}
