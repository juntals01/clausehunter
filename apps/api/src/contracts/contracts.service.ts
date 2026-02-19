import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Contract, ContractText, User } from '@expirationreminderai/database';
import { DashboardContract, PLAN_LIMITS } from '@expirationreminderai/shared';
import { StorageService } from '../storage/storage.service';
import { BillingService } from '../billing/billing.service';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractText)
        private contractTextRepository: Repository<ContractText>,
        @InjectQueue('contract-ocr') private ocrQueue: Queue,
        @InjectQueue('contract-extract') private extractQueue: Queue,
        @InjectQueue('email-send') private emailQueue: Queue,
        private storageService: StorageService,
        private billingService: BillingService,
    ) {}

    async createContract(file: Express.Multer.File, userId: string) {
        const plan = await this.billingService.getUserPlan(userId);
        const limit = PLAN_LIMITS[plan];

        if (limit !== Infinity) {
            const count = await this.contractRepository.count({ where: { userId } });
            if (count >= limit) {
                throw new ForbiddenException(
                    `You've reached the ${limit}-contract limit on the ${plan} plan. Upgrade to upload more.`,
                );
            }
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);

        const contract = this.contractRepository.create({
            originalFilename: file.originalname,
            storedFilename: fileName,
            userId,
            status: 'queued',
        });
        await this.contractRepository.save(contract);

        await this.ocrQueue.add('process-ocr', {
            contractId: contract.id,
            fileName,
        });

        return contract;
    }

    async getContract(id: string, userId: string) {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Contract not found');
        if (contract.userId && contract.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        return contract;
    }

    async updateContract(id: string, data: UpdateContractDto, userId: string) {
        const contract = await this.getContract(id, userId);

        // Check if deadline-affecting fields changed
        const deadlineChanged =
            (data.endDate !== undefined &&
                String(data.endDate) !== String(contract.endDate)) ||
            (data.noticeDays !== undefined &&
                data.noticeDays !== contract.noticeDays);

        const updatePayload: Partial<Contract> = {
            vendor: data.vendor,
            endDate: data.endDate as any,
            noticeDays: data.noticeDays,
            autoRenews: data.autoRenews,
        };

        // Reset lastAlertedOn so the alert system re-evaluates this contract
        if (deadlineChanged) {
            updatePayload.lastAlertedOn = null;
        }

        await this.contractRepository.update(contract.id, updatePayload);

        // If deadline fields changed, immediately check if an alert should be sent
        if (deadlineChanged) {
            this.sendImmediateAlertIfNeeded(contract.id, userId).catch((err) =>
                console.error(`[CONTRACTS] Failed to send immediate alert for ${contract.id}:`, err),
            );
        }

        return this.contractRepository.findOne({ where: { id } });
    }

    /**
     * Re-evaluate a single contract's alert after an edit.
     * If the updated deadline warrants an alert, enqueue one immediately.
     */
    private async sendImmediateAlertIfNeeded(contractId: string, userId: string) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId },
            relations: ['user'],
        });
        if (!contract || !contract.endDate || contract.noticeDays === null) return;

        const userEmail = contract.user?.email;
        if (!userEmail) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(contract.endDate);
        const daysDiff = Math.floor(
            (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const daysLeft = daysDiff - contract.noticeDays;

        // Send an alert if the contract is in a warning/urgent window
        if (daysLeft <= 30) {
            let urgency = 'Warning';
            if (daysLeft <= 0) urgency = 'CRITICAL';
            else if (daysLeft <= 7) urgency = 'URGENT';

            await this.emailQueue.add('send-email', {
                to: userEmail,
                subject: `Contract Updated: ${contract.vendor || 'Unknown Vendor'} — ${urgency}`,
                html: this.generateUpdateAlertHtml(contract, daysLeft, urgency),
                type: 'contract-alert',
            });

            await this.contractRepository.update(contractId, {
                lastAlertedOn: today,
            });

            console.log(
                `[CONTRACTS] Immediate alert enqueued for contract ${contractId} (${daysLeft} days left)`,
            );
        }
    }

    private generateUpdateAlertHtml(contract: Contract, daysLeft: number, urgency: string): string {
        const webUrl = process.env.WEB_URL || 'http://localhost:3000';
        let badgeColor = '#F59E0B';
        if (daysLeft <= 0) badgeColor = '#DC2626';
        else if (daysLeft <= 7) badgeColor = '#EF4444';

        return `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f5}
.wrapper{max-width:600px;margin:0 auto;padding:20px}
.card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#EA580C,#F97316);color:#fff;padding:24px 30px}
.header h1{margin:0;font-size:22px;font-weight:600}
.body{padding:30px}
.footer{padding:20px 30px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af}
.btn{display:inline-block;padding:12px 28px;background:#EA580C;color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;margin-top:16px}
.detail{margin:8px 0}.label{font-weight:600;color:#374151}
.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
</style></head><body><div class="wrapper"><div class="card">
<div class="header"><h1>${urgency}: Contract Details Updated</h1></div>
<div class="body">
  <p>A contract you're tracking has been updated and requires your attention:</p>
  <div class="detail"><span class="label">Vendor:</span> ${contract.vendor || 'Unknown'}</div>
  <div class="detail"><span class="label">End Date:</span> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Unknown'}</div>
  <div class="detail"><span class="label">Notice Period:</span> ${contract.noticeDays ?? 'Unknown'} days</div>
  <div class="detail"><span class="label">Days Left to Cancel:</span> <span class="badge" style="background:${badgeColor};color:#fff">${daysLeft} days</span></div>
  <div class="detail"><span class="label">Auto-Renews:</span> ${contract.autoRenews ? 'Yes' : contract.autoRenews === false ? 'No' : 'Unknown'}</div>
  ${daysLeft <= 0
            ? '<p style="color:#DC2626;font-weight:bold;margin-top:16px">The notice window is now open or has passed. Take action immediately!</p>'
            : `<p style="margin-top:16px">You have <strong>${daysLeft} days</strong> left to provide notice if you wish to cancel or renegotiate.</p>`}
  <a href="${webUrl}/contracts/${contract.id}" class="btn">View Contract</a>
</div>
<div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.</div>
</div></div></body></html>`;
    }

    async reprocessContract(id: string, userId: string) {
        const contract = await this.getContract(id, userId);

        if (contract.status !== 'failed' && contract.status !== 'processing') {
            throw new BadRequestException(
                'Only failed or stuck contracts can be reprocessed',
            );
        }

        // Check if we already have extracted text (OCR done, extraction failed)
        const existingText = await this.contractTextRepository.findOne({
            where: { contractId: contract.id },
        });

        if (existingText) {
            // OCR was already done - just re-run extraction
            await this.contractRepository.update(contract.id, {
                status: 'processing',
                errorMessage: null,
            });
            await this.extractQueue.add('extract-clauses', {
                contractId: contract.id,
            });
        } else {
            // Need to re-run OCR from scratch
            await this.contractRepository.update(contract.id, {
                status: 'queued',
                errorMessage: null,
            });
            // Re-enqueue with the stored filename (the key in MinIO)
            await this.ocrQueue.add('process-ocr', {
                contractId: contract.id,
                fileName: contract.storedFilename,
            });
        }

        return this.contractRepository.findOne({ where: { id } });
    }

    async getContractFileUrl(id: string, userId: string) {
        const contract = await this.getContract(id, userId);
        if (!contract.storedFilename) {
            throw new NotFoundException('File not found for this contract');
        }
        const url = await this.storageService.getFileUrl(contract.storedFilename, 3600);
        return { url, filename: contract.originalFilename };
    }

    async deleteContract(id: string, userId: string) {
        const contract = await this.getContract(id, userId);
        await this.contractRepository.remove(contract);
        return { deleted: true };
    }

    async getContractAdmin(id: string) {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Contract not found');
        return contract;
    }

    async deleteContractAdmin(id: string) {
        const contract = await this.getContractAdmin(id);
        await this.contractRepository.remove(contract);
        return { deleted: true };
    }

    async getAllContracts() {
        return this.contractRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }

    async getDashboardContracts(userId: string): Promise<DashboardContract[]> {
        const contracts = await this.contractRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return contracts.map((contract) => {
            let daysLeftToCancel: number | null = null;
            let urgencyStatus: 'safe' | 'approaching' | 'in-window' | 'needs-review' = 'needs-review';

            if (contract.endDate && contract.noticeDays !== null) {
                const endDate = new Date(contract.endDate);
                const daysDiff = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                daysLeftToCancel = daysDiff - contract.noticeDays;

                if (daysLeftToCancel > 30) urgencyStatus = 'safe';
                else if (daysLeftToCancel >= 1) urgencyStatus = 'approaching';
                else urgencyStatus = 'in-window';
            }

            return {
                id: contract.id,
                vendor: contract.vendor,
                endDate: contract.endDate,
                noticeDays: contract.noticeDays,
                autoRenews: contract.autoRenews,
                status: contract.status as any,
                daysLeftToCancel,
                urgencyStatus,
            };
        });
    }
}
