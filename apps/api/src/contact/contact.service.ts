import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
    private adminEmail: string;
    private webUrl: string;

    constructor(
        @InjectQueue('email-send') private emailQueue: Queue,
        private config: ConfigService,
    ) {
        this.adminEmail = this.config.get('SMTP_USER', 'support@expirationreminderai.com');
        this.webUrl = this.config.get('WEB_URL', 'http://localhost:3000');
    }

    async submitContact(dto: ContactDto) {
        // Send notification email to admin
        await this.emailQueue.add('send-email', {
            to: this.adminEmail,
            subject: `[Contact Form] ${dto.subject}`,
            html: this.generateAdminNotificationHtml(dto),
            type: 'contact',
        });

        // Send confirmation email to the user
        await this.emailQueue.add('send-email', {
            to: dto.email,
            subject: `We received your message — Expiration Reminder AI`,
            html: this.generateConfirmationHtml(dto),
            type: 'contact',
        });

        console.log(`[CONTACT] Queued contact form from ${dto.email}: "${dto.subject}"`);

        return { message: 'Your message has been sent. We\'ll get back to you soon.' };
    }

    private generateAdminNotificationHtml(dto: ContactDto): string {
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #EA580C, #F97316); color: white; padding: 24px 30px; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .body { padding: 30px; }
  .footer { padding: 20px 30px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
  .field { margin: 12px 0; }
  .label { font-weight: 600; color: #374151; display: block; margin-bottom: 2px; }
  .value { color: #57534E; }
  .message-box { margin-top: 16px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; white-space: pre-wrap; }
  .btn { display: inline-block; padding: 10px 20px; background: #EA580C; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 12px; }
</style></head>
<body>
  <div class="wrapper"><div class="card">
    <div class="header"><h1>New Contact Form Submission</h1></div>
    <div class="body">
      <div class="field"><span class="label">From:</span> <span class="value">${dto.name} &lt;${dto.email}&gt;</span></div>
      <div class="field"><span class="label">Subject:</span> <span class="value">${dto.subject}</span></div>
      <div class="field"><span class="label">Message:</span></div>
      <div class="message-box">${dto.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <a href="mailto:${dto.email}?subject=Re: ${encodeURIComponent(dto.subject)}" class="btn">Reply to ${dto.name}</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI</div>
  </div></div>
</body></html>`;
    }

    private generateConfirmationHtml(dto: ContactDto): string {
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f5; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #EA580C, #F97316); color: white; padding: 24px 30px; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .body { padding: 30px; }
  .footer { padding: 20px 30px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
  .btn { display: inline-block; padding: 12px 28px; background: #EA580C; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
</style></head>
<body>
  <div class="wrapper"><div class="card">
    <div class="header"><h1>We Got Your Message!</h1></div>
    <div class="body">
      <p>Hi <strong>${dto.name}</strong>,</p>
      <p>Thank you for reaching out. We've received your message about <strong>"${dto.subject}"</strong> and our team will get back to you within 24 hours.</p>
      <p style="color: #6b7280; font-size: 14px;">In the meantime, feel free to explore our platform:</p>
      <a href="${this.webUrl}" class="btn">Visit Expiration Reminder AI</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.</div>
  </div></div>
</body></html>`;
    }
}
