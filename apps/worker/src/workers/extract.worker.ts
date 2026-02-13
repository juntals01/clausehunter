import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractText } from '@clausehunter/database';
import { ConductorService } from '../conductor/conductor.service';
import { KimiService } from '../services/kimi.service';

@Injectable()
export class ExtractWorker implements OnModuleInit {
    constructor(
        private conductorService: ConductorService,
        private kimiService: KimiService,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
    ) { }

    onModuleInit() {
        this.conductorService.startWorker(
            'contract_extract',
            this.execute.bind(this),
        );
    }

    async execute(task: any) {
        const { contractId } = task.inputData;

        console.log(`[EXTRACT] Processing contract ${contractId}...`);

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
                `[EXTRACT] Extracted fields for contract ${contractId}:`,
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

            console.log(`[EXTRACT] Contract ${contractId} is now ready`);

            return {
                contractId,
                extraction
            };
        } catch (error) {
            console.error(
                `[EXTRACT] Error processing contract ${contractId}:`,
                error,
            );

            await this.contractRepository.update(contractId, {
                status: 'failed',
                errorMessage: error.message,
            });

            throw error;
        }
    }
}
