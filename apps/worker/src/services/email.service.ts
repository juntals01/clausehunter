import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private fromEmail: string;
    private webUrl: string;

    constructor(private config: ConfigService) {}

    onModuleInit() {
        const smtpUserForFrom = this.config.get<string>('SMTP_USER') || 'noreply@expirationreminderai.com';
        this.fromEmail = this.config.get<string>('EMAIL_FROM') || smtpUserForFrom;
        this.webUrl = this.config.get('WEB_URL', 'http://localhost:3000');

        const smtpUser = this.config.get('SMTP_USER');
        const smtpPass = this.config.get('SMTP_PASSWORD');

        if (!smtpUser || !smtpPass) {
            console.warn('⚠️  SMTP credentials not configured. Email sending will fail.');
            // Create a stub transporter that logs instead of sending
            this.transporter = null as any;
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST', 'smtp.gmail.com'),
            port: Number(this.config.get('SMTP_PORT', 587)),
            secure: false, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass, // Gmail App Password (16 chars)
            },
        });

        console.log(`📧 Email service initialized (SMTP: ${this.config.get('SMTP_HOST', 'smtp.gmail.com')})`);
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        if (!this.transporter) {
            console.warn(`[EMAIL] Skipped (no SMTP config): ${options.subject} -> ${options.to}`);
            return;
        }

        try {
            await this.transporter.sendMail({
                from: `"ExpirationReminderAI" <${this.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            console.log(`[EMAIL] Sent: "${options.subject}" -> ${options.to}`);
        } catch (error: any) {
            console.error('[EMAIL] Send error:', error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    // ─── Email Templates ─────────────────────────────────────────────

    private baseTemplate(title: string, content: string): string {
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
    .btn:hover { background: #C2410C; }
    .detail { margin: 8px 0; }
    .label { font-weight: 600; color: #374151; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ExpirationReminderAI. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    generateWelcomeEmail(userName: string): string {
        return this.baseTemplate('Welcome to ExpirationReminderAI!', `
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

    generatePasswordResetEmail(userName: string, resetUrl: string): string {
        return this.baseTemplate('Reset Your Password', `
        <p>Hi <strong>${userName}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <a href="${resetUrl}" class="btn">Reset Password</a>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        `);
    }

    generateAlertEmail(contract: any, daysLeft: number): string {
        let urgency = 'Warning';
        let badgeColor = '#F59E0B';

        if (daysLeft <= 0) {
            urgency = 'CRITICAL';
            badgeColor = '#DC2626';
        } else if (daysLeft <= 7) {
            urgency = 'URGENT';
            badgeColor = '#EF4444';
        }

        const docName = contract.title || contract.vendor || 'Unknown';
        return this.baseTemplate(`${urgency}: Deadline Alert`, `
        <p>You have a document that requires attention:</p>
        <div class="detail"><span class="label">Document:</span> ${docName}</div>
        <div class="detail"><span class="label">Vendor:</span> ${contract.vendor || 'Unknown'}</div>
        <div class="detail"><span class="label">Due Date:</span> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Unknown'}</div>
        <div class="detail"><span class="label">Notice Period:</span> ${contract.noticeDays || 'Unknown'} days</div>
        <div class="detail"><span class="label">Days Left:</span> <span class="badge" style="background: ${badgeColor}; color: white;">${daysLeft} days</span></div>
        <div class="detail"><span class="label">Auto-Renews:</span> ${contract.autoRenews ? 'Yes' : 'No'}</div>
        ${daysLeft <= 0
            ? '<p style="color: #DC2626; font-weight: bold; margin-top: 16px;">The notice window is now open or has passed. Take action immediately!</p>'
            : `<p style="margin-top: 16px;">You have <strong>${daysLeft} days</strong> left to provide notice if you wish to cancel or renegotiate.</p>`
        }
        <a href="${this.webUrl}/dashboard/contracts/${contract.id || ''}" class="btn">View Document</a>
        `);
    }

    generateContractReadyEmail(contract: any, contractUrl: string): string {
        return this.baseTemplate('Document Analysis Complete', `
        <p>Great news! Your document has been analyzed and is ready to view.</p>
        <div class="detail"><span class="label">File:</span> ${contract.originalFilename || 'Document'}</div>
        <div class="detail"><span class="label">Vendor:</span> ${contract.vendor || 'Not detected'}</div>
        <div class="detail"><span class="label">Due Date:</span> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Not detected'}</div>
        <div class="detail"><span class="label">Notice Period:</span> ${contract.noticeDays != null ? `${contract.noticeDays} days` : 'Not detected'}</div>
        <div class="detail"><span class="label">Auto-Renews:</span> ${contract.autoRenews === true ? 'Yes' : contract.autoRenews === false ? 'No' : 'Not detected'}</div>
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">Review the extracted details to ensure everything looks correct. You can edit any field from the document page.</p>
        <a href="${contractUrl}" class="btn">View Document</a>
        `);
    }

    generateContractNeedsReviewEmail(contract: any, missingFields: string[], contractUrl: string): string {
        const missingList = missingFields
            .map((f) => `<li style="color: #B45309;">${f}</li>`)
            .join('');

        return this.baseTemplate('Action Required: Document Needs Review', `
        <p>Your document has been analyzed, but we couldn't automatically extract some important details:</p>
        <div class="detail"><span class="label">File:</span> ${contract.originalFilename || 'Document'}</div>
        <div class="detail"><span class="label">Vendor:</span> ${contract.vendor || 'Not detected'}</div>
        <div style="margin-top: 16px; padding: 16px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400E;">⚠️ Missing details:</p>
          <ul style="margin: 0; padding-left: 20px;">${missingList}</ul>
        </div>
        <p style="margin-top: 16px;">Without these details, we can't send you deadline alerts. Please review the document and fill in the missing fields manually.</p>
        <a href="${contractUrl}" class="btn">Review &amp; Complete Details</a>
        `);
    }

    generateFeedbackStatusEmail(feedbackTitle: string, oldStatus: string, newStatus: string, adminNote?: string | null): string {
        const statusColors: Record<string, string> = {
            open: '#3B82F6',
            in_progress: '#F59E0B',
            resolved: '#22C55E',
            closed: '#6B7280',
        };

        return this.baseTemplate('Support Ticket Updated', `
        <p>Your support ticket has been updated:</p>
        <div class="detail"><span class="label">Ticket:</span> ${feedbackTitle}</div>
        <div class="detail">
          <span class="label">Status:</span>
          <span class="badge" style="background: ${statusColors[oldStatus] || '#6B7280'}; color: white;">${oldStatus}</span>
          &rarr;
          <span class="badge" style="background: ${statusColors[newStatus] || '#6B7280'}; color: white;">${newStatus}</span>
        </div>
        ${adminNote ? `<div class="detail" style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 8px;"><span class="label">Admin Note:</span><br/>${adminNote}</div>` : ''}
        <a href="${this.webUrl}/help" class="btn">View Tickets</a>
        `);
    }

    generateBroadcastEmail(subject: string, body: string): string {
        return this.baseTemplate(subject, `
        <div>${body}</div>
        <a href="${this.webUrl}/dashboard" class="btn" style="margin-top: 24px;">Go to Dashboard</a>
        `);
    }
}
