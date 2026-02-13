import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@clausehunter/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async findAll(search?: string) {
        const where = search
            ? [
                  { name: ILike(`%${search}%`) },
                  { email: ILike(`%${search}%`) },
              ]
            : undefined;

        const users = await this.userRepo.find({ where, order: { createdAt: 'DESC' } });
        return users.map(this.sanitizeUser);
    }

    async findOne(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.sanitizeUser(user);
    }

    async create(dto: CreateUserDto) {
        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: dto.role ?? 'user',
            status: dto.status ?? 'active',
            company: dto.company ?? null,
        });

        const saved = await this.userRepo.save(user);
        return this.sanitizeUser(saved);
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (dto.name !== undefined) user.name = dto.name;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;
        if (dto.status !== undefined) user.status = dto.status;
        if (dto.company !== undefined) user.company = dto.company;
        if (dto.password) {
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        const updated = await this.userRepo.save(user);
        return this.sanitizeUser(updated);
    }

    async remove(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepo.remove(user);
        return { deleted: true };
    }

    async count() {
        return this.userRepo.count();
    }

    private sanitizeUser(user: User) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
}
