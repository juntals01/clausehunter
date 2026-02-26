import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureRequest, FeatureRequestVote } from '@expirationreminderai/database';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';
import { UpdateFeatureRequestStatusDto } from './dto/update-feature-request-status.dto';

@Injectable()
export class FeatureRequestsService {
    constructor(
        @InjectRepository(FeatureRequest)
        private readonly requestRepo: Repository<FeatureRequest>,
        @InjectRepository(FeatureRequestVote)
        private readonly voteRepo: Repository<FeatureRequestVote>,
    ) {}

    async create(userId: string, dto: CreateFeatureRequestDto): Promise<FeatureRequest> {
        const request = this.requestRepo.create({
            userId,
            title: dto.title,
            description: dto.description,
        });
        return this.requestRepo.save(request);
    }

    async findAll(userId?: string): Promise<(FeatureRequest & { hasVoted?: boolean })[]> {
        const requests = await this.requestRepo.find({
            relations: ['user'],
            order: { voteCount: 'DESC', createdAt: 'DESC' },
        });

        if (!userId) {
            return requests.map((r) => ({ ...r, hasVoted: false }));
        }

        const votes = await this.voteRepo.find({ where: { userId } });
        const votedIds = new Set(votes.map((v) => v.featureRequestId));

        return requests.map((r) => ({
            ...r,
            hasVoted: votedIds.has(r.id),
        }));
    }

    async findOne(id: string): Promise<FeatureRequest> {
        const request = await this.requestRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!request) {
            throw new NotFoundException('Feature request not found');
        }
        return request;
    }

    async toggleVote(featureRequestId: string, userId: string): Promise<{ voted: boolean; voteCount: number }> {
        const request = await this.requestRepo.findOne({ where: { id: featureRequestId } });
        if (!request) {
            throw new NotFoundException('Feature request not found');
        }

        const existingVote = await this.voteRepo.findOne({
            where: { featureRequestId, userId },
        });

        if (existingVote) {
            await this.voteRepo.remove(existingVote);
            request.voteCount = Math.max(0, request.voteCount - 1);
            await this.requestRepo.save(request);
            return { voted: false, voteCount: request.voteCount };
        }

        const vote = this.voteRepo.create({ featureRequestId, userId });
        await this.voteRepo.save(vote);
        request.voteCount += 1;
        await this.requestRepo.save(request);
        return { voted: true, voteCount: request.voteCount };
    }

    async updateStatus(id: string, dto: UpdateFeatureRequestStatusDto): Promise<FeatureRequest> {
        const request = await this.requestRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!request) {
            throw new NotFoundException('Feature request not found');
        }

        if (dto.status !== undefined) request.status = dto.status;
        if (dto.adminResponse !== undefined) request.adminResponse = dto.adminResponse;

        return this.requestRepo.save(request);
    }

    async remove(id: string): Promise<void> {
        const request = await this.requestRepo.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException('Feature request not found');
        }
        await this.requestRepo.remove(request);
    }
}
