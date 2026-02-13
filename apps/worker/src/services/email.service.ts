import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

@Injectable()
export class EmailService {
    private provider: string;
    private apiKey: string;
    private fromEmail: string;

    constructor(private config: ConfigService) {
        this.provider = this.config.get('EMAIL_PROVIDER', 'sendgrid');
        this.apiKey = this.config.get('SENDGRID_API_KEY');
        this.fromEmail = this.config.get('EMAIL_FROM', 'alerts@clausehunter.com');
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        if (this.provider === 'sendgrid') {
            return this.sendWithSendGrid(options);
        }

        throw new Error(`Unsupported email provider: ${this.provider}`);
    }

    private async sendWithSendGrid(options: EmailOptions): Promise<void> {
        try {
            await axios.post(
                'https://api.sendgrid.com/v3/mail/send',
                {
                    personalizations: [
                        {
                            to: [{ email: options.to }],
                            subject: options.subject,
                        },
                    ],
                    from: { email: this.fromEmail },
                    content: [
                        {
                            type: 'text/html',
                            value: options.html,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log(`Email sent to ${options.to}`);
        } catch (error) {
            console.error('Email send error:', error.response?.data || error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Generate HTML for renewal alert email
     */
    generateAlertEmail(contract: any, daysLeft: number): string {
        let urgency = 'Warning';
        let color = '#FFA500';

        if (daysLeft <= 0) {
            urgency = 'CRITICAL';
            color = '#DC2626';
        } else if (daysLeft <= 7) {
            urgency = 'URGENT';
            color = '#EF4444';
        }

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; }
            .cta { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${urgency}: Contract Renewal Alert</h1>
            </div>
            <div class="content">
              <p>You have a contract that requires attention:</p>
              
              <div class="detail">
                <span class="label">Vendor:</span> ${contract.vendor || 'Unknown'}
              </div>
              <div class="detail">
                <span class="label">Contract End Date:</span> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Unknown'}
              </div>
              <div class="detail">
                <span class="label">Notice Period:</span> ${contract.noticeDays || 'Unknown'} days
              </div>
              <div class="detail">
                <span class="label">Days Left to Cancel:</span> <strong>${daysLeft}</strong>
              </div>
              <div class="detail">
                <span class="label">Auto-Renews:</span> ${contract.autoRenews ? 'Yes' : 'No'}
              </div>

              ${daysLeft <= 0
                ? '<p style="color: #DC2626; font-weight: bold;">⚠️ The notice window is now open or has passed. Take action immediately!</p>'
                : `<p>You have ${daysLeft} days left to provide notice if you wish to cancel or renegotiate this contract.</p>`
            }

              <a href="${this.config.get('WEB_URL', 'http://localhost:3000')}/dashboard" class="cta">
                View Dashboard
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}
