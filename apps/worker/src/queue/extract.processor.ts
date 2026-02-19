import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Job, Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Contract, ContractText, Notification, User } from '@expirationreminderai/database';
import { KimiService } from '../services/kimi.service';
import { EmailService } from '../services/email.service';

@Processor('contract-extract', {
    concurrency: 1,
})
export class ExtractProcessor extends WorkerHost {
    constructor(
        private kimiService: KimiService,
        private emailService: EmailService,
        private config: ConfigService,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectQueue('email-send') private emailQueue: Queue,
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

            // Safely parse the end date — AI may return non-date strings like "Not specified"
            let endDate: Date | null = null;
            if (extraction.contract_end_date) {
                const parsed = new Date(extraction.contract_end_date);
                if (!isNaN(parsed.getTime())) {
                    endDate = parsed;
                } else {
                    console.warn(
                        `[BullMQ EXTRACT] Invalid end date "${extraction.contract_end_date}" for contract ${contractId}, setting to null`,
                    );
                }
            }

            // Safely parse notice days — AI may return non-numeric values
            let noticeDays: number | null = null;
            if (extraction.notice_period_days != null) {
                const parsed = Number(extraction.notice_period_days);
                if (!isNaN(parsed) && parsed >= 0) {
                    noticeDays = parsed;
                }
            }

            // Update contract with extracted fields + full extraction data
            await this.contractRepository.update(contractId, {
                vendor: extraction.vendor_name || null,
                endDate,
                noticeDays,
                autoRenews: typeof extraction.auto_renews === 'boolean' ? extraction.auto_renews : null,
                extractionData: extraction as any,
                status: 'ready',
            });

            console.log(`[BullMQ EXTRACT] Contract ${contractId} is now ready`);

            // Create notification + send email to user
            const contract = await this.contractRepository.findOne({ where: { id: contractId } });
            if (contract?.userId) {
                const vendorName = extraction.vendor_name || contract.originalFilename;

                // In-app notification
                await this.notificationRepository.save(
                    this.notificationRepository.create({
                        userId: contract.userId,
                        type: 'contract_ready',
                        title: 'Contract analysis complete',
                        message: `"${vendorName}" has been analyzed. View the extracted details now.`,
                        contractId,
                    }),
                );

                // Send email — "needs review" if key fields are missing, otherwise "ready"
                try {
                    const user = await this.userRepository.findOne({ where: { id: contract.userId } });
                    if (user?.email) {
                        const webUrl = this.config.get('WEB_URL', 'http://localhost:3000');
                        const contractUrl = `${webUrl}/contracts/${contractId}`;

                        // Check which critical fields are missing
                        const missingFields: string[] = [];
                        if (!endDate) missingFields.push('Contract End Date');
                        if (noticeDays == null) missingFields.push('Notice Period');
                        if (!extraction.vendor_name) missingFields.push('Vendor Name');

                        if (missingFields.length > 0) {
                            // Send "needs review" email
                            await this.emailQueue.add('send-email', {
                                to: user.email,
                                subject: `Action Required: "${vendorName}" needs your review`,
                                html: this.emailService.generateContractNeedsReviewEmail(contract, missingFields, contractUrl),
                                type: 'contract-alert',
                            });
                            console.log(`[BullMQ EXTRACT] Needs-review email enqueued for ${user.email} (missing: ${missingFields.join(', ')})`);
                        } else {
                            // Send "contract ready" email
                            await this.emailQueue.add('send-email', {
                                to: user.email,
                                subject: `Contract Analyzed: ${vendorName}`,
                                html: this.emailService.generateContractReadyEmail(contract, contractUrl),
                                type: 'contract-alert',
                            });
                            console.log(`[BullMQ EXTRACT] Contract-ready email enqueued for ${user.email}`);
                        }
                    }
                } catch (emailErr) {
                    console.error(`[BullMQ EXTRACT] Failed to enqueue email:`, emailErr);
                }
            }

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

            // Create failure notification
            const contract = await this.contractRepository.findOne({ where: { id: contractId } });
            if (contract?.userId) {
                await this.notificationRepository.save(
                    this.notificationRepository.create({
                        userId: contract.userId,
                        type: 'contract_failed',
                        title: 'Contract analysis failed',
                        message: `"${contract.originalFilename}" could not be analyzed. You can retry from the contract page.`,
                        contractId,
                    }),
                );
            }

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
