import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Feedback } from '@expirationreminderai/database';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepo: Repository<Feedback>,
        @InjectQueue('email-send') private emailQueue: Queue,
        private readonly configService: ConfigService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(userId: string, dto: CreateFeedbackDto): Promise<Feedback> {
        const feedback = this.feedbackRepo.create({
            userId,
            title: dto.title,
            description: dto.description,
            category: dto.category ?? 'other',
            priority: dto.priority ?? 'medium',
        });
        return this.feedbackRepo.save(feedback);
    }

    async getUserFeedback(userId: string): Promise<Feedback[]> {
        return this.feedbackRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getUserFeedbackById(id: string, userId: string): Promise<Feedback> {
        const feedback = await this.feedbackRepo.findOne({
            where: { id, userId },
        });
        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }
        return feedback;
    }

    async getAllFeedback(): Promise<Feedback[]> {
        return this.feedbackRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateStatus(id: string, dto: UpdateFeedbackStatusDto): Promise<Feedback> {
        const feedback = await this.feedbackRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }

        const oldStatus = feedback.status;
        const oldNote = feedback.adminNote;

        if (dto.status !== undefined) feedback.status = dto.status;
        if (dto.adminNote !== undefined) feedback.adminNote = dto.adminNote;

        const saved = await this.feedbackRepo.save(feedback);

        const statusChanged = dto.status && dto.status !== oldStatus;
        const noteAdded = dto.adminNote !== undefined && dto.adminNote !== oldNote;

        // Only notify if something actually changed
        if ((statusChanged || noteAdded) && feedback.user) {
            const webUrl = this.configService.get('WEB_URL', 'http://localhost:3000');

            // Build notification message
            const parts: string[] = [];
            if (statusChanged) parts.push(`Status changed to ${dto.status!.replace('_', ' ')}`);
            if (noteAdded && dto.adminNote) parts.push(`Admin response: "${dto.adminNote}"`);
            const message = parts.join('. ') || 'Your ticket has been updated.';

            // Create in-app notification
            await this.notificationsService.createNotification({
                userId: feedback.userId,
                type: 'ticket_response',
                title: `Ticket Updated: ${feedback.title}`,
                message,
            }).catch((err) => {
                console.error('[FEEDBACK] Failed to create notification:', err.message);
            });

            // Send email notification
            if (feedback.user.email) {
                await this.emailQueue.add('send-email', {
                    to: feedback.user.email,
                    subject: `Support Ticket Updated: ${feedback.title}`,
                    html: this.generateStatusChangeEmail(
                        feedback.title,
                        oldStatus,
                        dto.status ?? oldStatus,
                        dto.adminNote,
                        webUrl,
                    ),
                    type: 'feedback-status',
                }).catch((err) => {
                    console.error('[FEEDBACK] Failed to enqueue status email:', err.message);
                });
            }
        }

        return saved;
    }

    private generateStatusChangeEmail(
        title: string,
        oldStatus: string,
        newStatus: string,
        adminNote?: string,
        webUrl: string = 'http://localhost:3000',
    ): string {
        const statusColors: Record<string, string> = {
            open: '#3B82F6',
            in_progress: '#F59E0B',
            resolved: '#22C55E',
            closed: '#6B7280',
        };

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #EA580C, #F97316); color: white; padding: 24px 30px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .body { padding: 30px; }
    .footer { padding: 20px 30px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
    .btn { display: inline-block; padding: 12px 28px; background: #EA580C; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
    .detail { margin: 8px 0; }
    .label { font-weight: 600; color: #374151; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header"><h1>Support Ticket Updated</h1></div>
      <div class="body">
        <p>Your support ticket has been updated:</p>
        <div class="detail"><span class="label">Ticket:</span> ${title}</div>
        ${oldStatus !== newStatus ? `<div class="detail">
          <span class="label">Status:</span>
          <span class="badge" style="background: ${statusColors[oldStatus] || '#6B7280'};">${oldStatus.replace('_', ' ')}</span>
          &rarr;
          <span class="badge" style="background: ${statusColors[newStatus] || '#6B7280'};">${newStatus.replace('_', ' ')}</span>
        </div>` : `<div class="detail"><span class="label">Status:</span> <span class="badge" style="background: ${statusColors[newStatus] || '#6B7280'};">${newStatus.replace('_', ' ')}</span></div>`}
        ${adminNote ? `<div class="detail" style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 8px;"><span class="label">Admin Response:</span><br/>${adminNote}</div>` : ''}
        <a href="${webUrl}/help" class="btn">View Tickets</a>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
    }
}
