import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import * as cron from 'node-cron';
import { Contract } from '@clausehunter/database';
import { EmailService } from '../services/email.service';

@Injectable()
export class EmailAlertsService implements OnModuleInit {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        private emailService: EmailService,
    ) { }

    onModuleInit() {
        // Run daily at 09:00 Asia/Manila (01:00 UTC)
        // Cron format: minute hour day month weekday
        cron.schedule('0 1 * * *', () => {
            this.sendDailyAlerts();
        });

        console.log(
            '📧 Email alerts cron job scheduled (daily at 09:00 Asia/Manila)',
        );
    }

    async sendDailyAlerts() {
        console.log('[EMAIL ALERTS] Running daily alert check...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all ready contracts with end date and notice period
            const contracts = await this.contractRepository.find({
                where: {
                    status: 'ready',
                    endDate: Not(IsNull()),
                    noticeDays: Not(IsNull()),
                },
            });

            console.log(`[EMAIL ALERTS] Checking ${contracts.length} contracts...`);

            for (const contract of contracts) {
                if (!contract.endDate || contract.noticeDays === null) continue;

                const endDate = new Date(contract.endDate);
                const daysDiff = Math.floor(
                    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                );
                const daysLeft = daysDiff - contract.noticeDays;

                // Check if we should send an alert
                const shouldAlert =
                    daysLeft === 30 || // Warning
                    daysLeft === 7 || // Urgent
                    daysLeft <= 0; // Critical

                // Check if already alerted today
                const alreadyAlerted =
                    contract.lastAlertedOn &&
                    new Date(contract.lastAlertedOn).toDateString() ===
                    today.toDateString();

                if (shouldAlert && !alreadyAlerted) {
                    console.log(
                        `[EMAIL ALERTS] Sending alert for contract ${contract.id} (${daysLeft} days left)`,
                    );

                    try {
                        // TODO: Get user email from user settings/profile
                        const userEmail = process.env.ALERT_EMAIL || 'admin@example.com';

                        await this.emailService.sendEmail({
                            to: userEmail,
                            subject: `Contract Alert: ${contract.vendor || 'Unknown Vendor'}`,
                            html: this.emailService.generateAlertEmail(contract, daysLeft),
                        });

                        // Update last alerted date
                        await this.contractRepository.update(contract.id, {
                            lastAlertedOn: today,
                        });

                        console.log(
                            `[EMAIL ALERTS] Alert sent for contract ${contract.id}`,
                        );
                    } catch (error) {
                        console.error(
                            `[EMAIL ALERTS] Failed to send alert for contract ${contract.id}:`,
                            error,
                        );
                    }
                }
            }

            console.log('[EMAIL ALERTS] Daily alert check completed');
        } catch (error) {
            console.error('[EMAIL ALERTS] Error in daily alert check:', error);
        }
    }
}
