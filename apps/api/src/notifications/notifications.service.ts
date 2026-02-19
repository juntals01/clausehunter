import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@expirationreminderai/database';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}

    async getUserNotifications(userId: string, limit = 20) {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async getUnreadCount(userId: string) {
        return this.notificationRepository.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        await this.notificationRepository.update(
            { id, userId },
            { read: true },
        );
        return { success: true };
    }

    async markAllAsRead(userId: string) {
        await this.notificationRepository.update(
            { userId, read: false },
            { read: true },
        );
        return { success: true };
    }

    async createNotification(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        contractId?: string;
    }) {
        const notification = this.notificationRepository.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            contractId: data.contractId || null,
        });
        return this.notificationRepository.save(notification);
    }
}
