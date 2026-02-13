import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@clausehunter/database';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            company: dto.company ?? null,
        });

        const saved = await this.userRepo.save(user);

        return {
            ...this.generateToken(saved),
            user: this.sanitizeUser(saved),
        };
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Google-only users cannot use password login
        if (!user.passwordHash) {
            throw new UnauthorizedException(
                'This account uses Google sign-in. Please sign in with Google.',
            );
        }

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            ...this.generateToken(user),
            user: this.sanitizeUser(user),
        };
    }

    async findOrCreateGoogleUser(googleId: string, email: string, name: string) {
        // 1. Try to find by googleId
        let user = await this.userRepo.findOne({ where: { googleId } });

        if (!user) {
            // 2. Try to find by email (link existing account)
            user = await this.userRepo.findOne({ where: { email } });

            if (user) {
                // Link Google to existing account
                user.googleId = googleId;
                user = await this.userRepo.save(user);
            } else {
                // 3. Create new user (no password)
                user = this.userRepo.create({
                    name,
                    email,
                    googleId,
                    passwordHash: null,
                });
                user = await this.userRepo.save(user);
            }
        }

        return {
            ...this.generateToken(user),
            user: this.sanitizeUser(user),
        };
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { id: userId } });
    }

    generateToken(user: User) {
        return {
            access_token: this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
            }),
        };
    }

    sanitizeUser(user: User) {
        const { passwordHash, googleId, ...rest } = user;
        return rest;
    }
}
