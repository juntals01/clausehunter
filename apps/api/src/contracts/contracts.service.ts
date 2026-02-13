import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Contract } from '@clausehunter/database';
import { DashboardContract } from '@clausehunter/shared';
import { StorageService } from '../storage/storage.service';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectQueue('contract-ocr') private ocrQueue: Queue,
        private storageService: StorageService,
    ) {}

    async createContract(file: Express.Multer.File, userId: string) {
        const fileName = `${Date.now()}-${file.originalname}`;
        await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);

        const contract = this.contractRepository.create({
            originalFilename: file.originalname,
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
        await this.contractRepository.update(contract.id, {
            vendor: data.vendor,
            endDate: data.endDate,
            noticeDays: data.noticeDays,
            autoRenews: data.autoRenews,
        });
        return this.contractRepository.findOne({ where: { id } });
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
