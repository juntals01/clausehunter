import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { Contract, ContractText } from '@clausehunter/database';
import { KimiService } from '../services/kimi.service';

@Processor('contract-extract', {
    concurrency: 1,
})
export class ExtractProcessor extends WorkerHost {
    constructor(
        private kimiService: KimiService,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
    ) {
        super();
    }

    async process(job: Job<{ contractId: string }>): Promise<any> {
        const { contractId } = job.data;

        console.log(`[BullMQ EXTRACT] Processing contract ${contractId}...`);

        try {
            // Get extracted text
            const contractText = await this.contractTextRepository.findOne({
                where: { contractId },
            });

            if (!contractText) {
                throw new Error('Contract text not found');
            }

            // Extract fields using Kimi K2
            const extraction = await this.kimiService.extractContractData(
                contractText.fullText,
            );

            console.log(
                `[BullMQ EXTRACT] Extracted fields for contract ${contractId}:`,
                extraction,
            );

            // Update contract with extracted fields
            await this.contractRepository.update(contractId, {
                vendor: extraction.vendor_name,
                endDate: extraction.contract_end_date ? new Date(extraction.contract_end_date) : null,
                noticeDays: extraction.notice_period_days,
                autoRenews: extraction.auto_renews,
                status: 'ready',
            });

            console.log(`[BullMQ EXTRACT] Contract ${contractId} is now ready`);

            return {
                contractId,
                extraction,
                success: true,
            };
        } catch (error) {
            console.error(
                `[BullMQ EXTRACT] Error processing contract ${contractId}:`,
                error,
            );

            await this.contractRepository.update(contractId, {
                status: 'failed',
                errorMessage: error.message,
            });

            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`[BullMQ EXTRACT] Job ${job.id} completed for contract ${job.data.contractId}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        console.error(`[BullMQ EXTRACT] Job ${job.id} failed:`, error.message);
    }
}
