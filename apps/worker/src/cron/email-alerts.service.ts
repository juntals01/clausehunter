import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository, IsNull, Not } from 'typeorm';
import * as cron from 'node-cron';
import { Contract, ContractItem } from '@expirationreminderai/database';
import { EmailService } from '../services/email.service';

@Injectable()
export class EmailAlertsService implements OnModuleInit {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(ContractItem)
        private contractItemRepository: Repository<ContractItem>,
        private emailService: EmailService,
        @InjectQueue('email-send') private emailQueue: Queue,
    ) { }

    onModuleInit() {
        // Run daily at 09:00 Asia/Manila (01:00 UTC)
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

            // Get all ready contracts with end date and notice period, include user
            const contracts = await this.contractRepository.find({
                where: {
                    status: 'ready',
                    endDate: Not(IsNull()),
                    noticeDays: Not(IsNull()),
                },
                relations: ['user'],
            });

            console.log(`[EMAIL ALERTS] Checking ${contracts.length} documents...`);

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
                    // Get user email from the contract's user relation
                    const userEmail = contract.user?.email;
                    if (!userEmail) {
                        console.warn(`[EMAIL ALERTS] No user email for contract ${contract.id}, skipping`);
                        continue;
                    }

                    console.log(
                        `[EMAIL ALERTS] Enqueuing alert for contract ${contract.id} -> ${userEmail} (${daysLeft} days left)`,
                    );

                    try {
                        // Enqueue via BullMQ for rate-limited sending
                        const docName = (contract as any).title || contract.vendor || 'Unknown';
                        await this.emailQueue.add('send-email', {
                            to: userEmail,
                            subject: `Deadline Alert: ${docName}`,
                            html: this.emailService.generateAlertEmail(contract, daysLeft),
                            type: 'contract-alert',
                        });

                        // Update last alerted date
                        await this.contractRepository.update(contract.id, {
                            lastAlertedOn: today,
                        });

                        console.log(
                            `[EMAIL ALERTS] Alert enqueued for contract ${contract.id}`,
                        );
                    } catch (error) {
                        console.error(
                            `[EMAIL ALERTS] Failed to enqueue alert for contract ${contract.id}:`,
                            error,
                        );
                    }
                }
            }

            // ─── Item-level alerts ─────────────────────────────────────
            await this.sendItemAlerts(today);

            console.log('[EMAIL ALERTS] Daily alert check completed');
        } catch (error) {
            console.error('[EMAIL ALERTS] Error in daily alert check:', error);
        }
    }

    private async sendItemAlerts(today: Date) {
        const items = await this.contractItemRepository.find({
            where: {
                expiryDate: Not(IsNull()),
                status: 'active',
            },
            relations: ['contract', 'contract.user'],
        });

        console.log(`[EMAIL ALERTS] Checking ${items.length} items for expiry...`);

        // Group expiring items by user so we send one email per user
        const userItems = new Map<string, { email: string; items: { item: ContractItem; daysLeft: number; docTitle: string }[] }>();

        for (const item of items) {
            if (!item.expiryDate || !item.contract?.user?.email) continue;

            const expiryDate = new Date(item.expiryDate);
            const daysLeft = Math.floor(
                (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            const shouldAlert = daysLeft === 30 || daysLeft === 7 || daysLeft <= 0;
            if (!shouldAlert) continue;

            const userId = item.contract.userId!;
            const email = item.contract.user.email;
            const docTitle = (item.contract as any).title || item.contract.vendor || 'Untitled Document';

            if (!userItems.has(userId)) {
                userItems.set(userId, { email, items: [] });
            }
            userItems.get(userId)!.items.push({ item, daysLeft, docTitle });
        }

        for (const [userId, data] of userItems) {
            try {
                const itemRows = data.items.map((entry) => {
                    let badgeColor = '#F59E0B';
                    let urgency = 'Warning';
                    if (entry.daysLeft <= 0) { badgeColor = '#DC2626'; urgency = 'CRITICAL'; }
                    else if (entry.daysLeft <= 7) { badgeColor = '#EF4444'; urgency = 'URGENT'; }

                    return `<tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${entry.item.name}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${entry.docTitle}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${new Date(entry.item.expiryDate!).toLocaleDateString()}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb"><span style="background:${badgeColor};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${entry.daysLeft <= 0 ? 'Overdue' : entry.daysLeft + 'd left'}</span></td>
                    </tr>`;
                }).join('');

                const html = this.emailService.generateItemAlertEmail(itemRows, data.items.length);

                await this.emailQueue.add('send-email', {
                    to: data.email,
                    subject: `Item Expiry Alert: ${data.items.length} item(s) need attention`,
                    html,
                    type: 'item-alert',
                });

                console.log(`[EMAIL ALERTS] Item alert enqueued for user ${userId} (${data.items.length} items)`);
            } catch (error) {
                console.error(`[EMAIL ALERTS] Failed to enqueue item alert for user ${userId}:`, error);
            }
        }
    }
}
