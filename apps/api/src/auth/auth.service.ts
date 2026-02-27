import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@expirationreminderai/database';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectQueue('email-send') private emailQueue: Queue,
        private readonly configService: ConfigService,
        private readonly notificationsService: NotificationsService,
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

        // Send welcome email + in-app notification (non-blocking)
        await this.sendWelcome(saved);

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

    async findOrCreateGoogleUser(googleId: string, email: string, name: string, avatar: string | null) {
        // 1. Try to find by googleId
        let user = await this.userRepo.findOne({ where: { googleId } });

        if (user) {
            // Update avatar on every login (Google may change it)
            if (avatar && user.avatar !== avatar) {
                user.avatar = avatar;
                user = await this.userRepo.save(user);
            }
        } else {
            // 2. Try to find by email (link existing account)
            user = await this.userRepo.findOne({ where: { email } });

            if (user) {
                // Link Google to existing account
                user.googleId = googleId;
                if (avatar) user.avatar = avatar;
                user = await this.userRepo.save(user);
            } else {
                // 3. Create new user (no password)
                user = this.userRepo.create({
                    name,
                    email,
                    googleId,
                    avatar,
                    passwordHash: null,
                });
                user = await this.userRepo.save(user);

                // Send welcome email + in-app notification (non-blocking)
                await this.sendWelcome(user);
            }
        }

        return {
            ...this.generateToken(user),
            user: this.sanitizeUser(user),
        };
    }

    // ─── Forgot Password ─────────────────────────────────────────────

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return { message: 'If that email exists, a reset link has been sent.' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await this.userRepo.save(user);

        // Build reset URL
        const webUrl = this.configService.get('WEB_URL', 'http://localhost:3000');
        const resetUrl = `${webUrl}/reset-password?token=${resetToken}`;

        // Enqueue password reset email
        await this.emailQueue.add('send-email', {
            to: user.email,
            subject: 'Reset Your Password - ExpirationReminderAI',
            html: this.generatePasswordResetEmailHtml(user.name, resetUrl),
            type: 'password-reset',
        });

        return { message: 'If that email exists, a reset link has been sent.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.userRepo.findOne({
            where: { resetToken: dto.token },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new BadRequestException('Reset token has expired. Please request a new one.');
        }

        // Update password and clear token
        user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await this.userRepo.save(user);

        return { message: 'Password has been reset successfully. You can now sign in.' };
    }

    // ─── Profile ─────────────────────────────────────────────────────

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Handle password change
        if (dto.newPassword) {
            if (!user.passwordHash) {
                // Google-only user setting a password for the first time
                user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
            } else {
                if (!dto.currentPassword) {
                    throw new BadRequestException('Current password is required');
                }
                const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
                if (!isMatch) {
                    throw new BadRequestException('Current password is incorrect');
                }
                user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
            }
        }

        // Handle profile field updates (email is not editable)
        if (dto.name !== undefined) user.name = dto.name;
        if (dto.company !== undefined) user.company = dto.company;

        const saved = await this.userRepo.save(user);
        return this.sanitizeUser(saved);
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
        const { passwordHash, googleId, resetToken, resetTokenExpires, ...rest } = user;
        return rest;
    }

    // ─── Welcome Helpers ───────────────────────────────────────────────

    private async sendWelcome(user: User): Promise<void> {
        // In-app notification
        await this.notificationsService.createNotification({
            userId: user.id,
            type: 'welcome',
            title: 'Welcome to ExpirationReminderAI!',
            message: `Hi ${user.name}, add your first document to start tracking deadlines.`,
        }).catch((err) => {
            console.error('[AUTH] Failed to create welcome notification:', err.message);
        });

        // Welcome email
        await this.emailQueue.add('send-email', {
            to: user.email,
            subject: 'Welcome to ExpirationReminderAI!',
            html: this.generateWelcomeEmailHtml(user.name),
            type: 'welcome',
        }).catch((err) => {
            console.error('[AUTH] Failed to enqueue welcome email:', err.message);
        });
    }

    // ─── Inline Email HTML Generators (lightweight, no worker dependency) ─

    private get webUrl(): string {
        return this.configService.get('WEB_URL', 'http://localhost:3000');
    }

    private baseEmailTemplate(title: string, content: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #EA580C, #F97316); color: white; padding: 24px 30px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .body { padding: 30px; }
    .footer { padding: 20px 30px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
    .btn { display: inline-block; padding: 12px 28px; background: #EA580C; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header"><h1>${title}</h1></div>
      <div class="body">${content}</div>
      <div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
    }

    private generateWelcomeEmailHtml(userName: string): string {
        return this.baseEmailTemplate('Welcome to ExpirationReminderAI!', `
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Welcome to ExpirationReminderAI! Your account has been created successfully.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li><strong>Upload documents</strong> - Drop your PDFs and we'll extract key dates and clauses automatically</li>
          <li><strong>Track deadlines</strong> - Get alerts before expiration dates, renewals, and notice windows</li>
          <li><strong>Add any document</strong> - Track licenses, insurance, certifications, contracts, and more</li>
        </ul>
        <a href="${this.webUrl}/dashboard" class="btn">Go to Dashboard</a>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">If you have any questions, visit our Help center or reply to this email.</p>
        `);
    }

    private generatePasswordResetEmailHtml(userName: string, resetUrl: string): string {
        return this.baseEmailTemplate('Reset Your Password', `
        <p>Hi <strong>${userName}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <a href="${resetUrl}" class="btn">Reset Password</a>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        `);
    }
}
