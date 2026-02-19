import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../services/email.service';

export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
    type: 'welcome' | 'password-reset' | 'contract-alert' | 'feedback-status' | 'broadcast' | 'contact';
}

@Processor('email-send', {
    concurrency: 2,
    limiter: {
        max: 10,       // max 10 emails per duration window
        duration: 60000, // per 60 seconds — ~400/day safe for Gmail
    },
})
@Injectable()
export class EmailProcessor extends WorkerHost {
    constructor(private emailService: EmailService) {
        super();
    }

    async process(job: Job<EmailJobData>): Promise<any> {
        const { to, subject, html, type } = job.data;

        console.log(`[EMAIL-QUEUE] Processing ${type} email to ${to} (job ${job.id})`);

        try {
            await this.emailService.sendEmail({ to, subject, html });
            return { success: true, to, type };
        } catch (error: any) {
            console.error(`[EMAIL-QUEUE] Failed ${type} email to ${to}:`, error.message);
            throw error; // BullMQ will retry based on queue config
        }
    }
}
