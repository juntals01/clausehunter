import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Feedback } from '@expirationreminderai/database';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { AdminFeedbackController } from './admin-feedback.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        BullModule.registerQueue({ name: 'email-send' }),
        NotificationsModule,
    ],
    controllers: [FeedbackController, AdminFeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule {}
