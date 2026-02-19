import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '@expirationreminderai/database';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';

@Injectable()
export class AdminEmailService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectQueue('email-send') private emailQueue: Queue,
        private readonly configService: ConfigService,
    ) {}

    async broadcastEmail(dto: BroadcastEmailDto) {
        // Fetch target users
        const where: any = { status: 'active' };
        if (dto.targetRole && dto.targetRole !== 'all') {
            where.role = dto.targetRole;
        }

        const users = await this.userRepo.find({ where });

        if (users.length === 0) {
            return { queued: 0, message: 'No users found matching the criteria.' };
        }

        const webUrl = this.configService.get('WEB_URL', 'http://localhost:3000');

        // Enqueue one email per user
        let queued = 0;
        for (const user of users) {
            try {
                await this.emailQueue.add('send-email', {
                    to: user.email,
                    subject: dto.subject,
                    html: this.generateBroadcastHtml(dto.subject, dto.body, webUrl),
                    type: 'broadcast',
                });
                queued++;
            } catch (err: any) {
                console.error(`[BROADCAST] Failed to enqueue for ${user.email}:`, err.message);
            }
        }

        return {
            queued,
            total: users.length,
            message: `${queued} email(s) queued for delivery.`,
        };
    }

    private generateBroadcastHtml(subject: string, body: string, webUrl: string): string {
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
      <div class="header"><h1>${subject}</h1></div>
      <div class="body">
        <div>${body}</div>
        <a href="${webUrl}/dashboard" class="btn" style="margin-top: 24px;">Go to Dashboard</a>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
    }
}
