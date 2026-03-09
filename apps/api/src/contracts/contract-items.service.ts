import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractItem } from '@expirationreminderai/database';
import { CreateContractItemDto } from './dto/create-contract-item.dto';
import { UpdateContractItemDto } from './dto/update-contract-item.dto';

@Injectable()
export class ContractItemsService {
    constructor(
        @InjectRepository(Contract)
        private readonly contractRepo: Repository<Contract>,
        @InjectRepository(ContractItem)
        private readonly itemRepo: Repository<ContractItem>,
    ) {}

    private async verifyOwnership(contractId: string, userId: string): Promise<Contract> {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');
        if (contract.userId !== userId) throw new ForbiddenException();
        return contract;
    }

    async findAll(contractId: string, userId: string) {
        await this.verifyOwnership(contractId, userId);
        return this.itemRepo
            .createQueryBuilder('item')
            .where('item.contractId = :contractId', { contractId })
            .orderBy('item.expiry_date IS NULL', 'ASC')
            .addOrderBy('item.expiry_date', 'ASC')
            .addOrderBy('item.name', 'ASC')
            .addOrderBy('item.id', 'ASC')
            .getMany();
    }

    async create(contractId: string, dto: CreateContractItemDto, userId: string) {
        await this.verifyOwnership(contractId, userId);
        const item = this.itemRepo.create({
            contractId,
            name: dto.name,
            description: dto.description ?? null,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
            noticeDays: dto.noticeDays ?? null,
            sourceText: dto.sourceText ?? null,
        });
        return this.itemRepo.save(item);
    }

    async update(contractId: string, itemId: string, dto: UpdateContractItemDto, userId: string) {
        await this.verifyOwnership(contractId, userId);
        const item = await this.itemRepo.findOne({ where: { id: itemId, contractId } });
        if (!item) throw new NotFoundException('Item not found');

        if (dto.name !== undefined) item.name = dto.name;
        if (dto.description !== undefined) item.description = dto.description ?? null;
        if (dto.expiryDate !== undefined) item.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
        if (dto.noticeDays !== undefined) item.noticeDays = dto.noticeDays ?? null;
        if (dto.status !== undefined) item.status = dto.status;
        if (dto.sourceText !== undefined) item.sourceText = dto.sourceText ?? null;

        return this.itemRepo.save(item);
    }

    async remove(contractId: string, itemId: string, userId: string) {
        await this.verifyOwnership(contractId, userId);
        const item = await this.itemRepo.findOne({ where: { id: itemId, contractId } });
        if (!item) throw new NotFoundException('Item not found');
        await this.itemRepo.remove(item);
        return { deleted: true };
    }
}
