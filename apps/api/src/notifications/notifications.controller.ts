import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async getNotifications(@Request() req: any) {
        const [notifications, unreadCount] = await Promise.all([
            this.notificationsService.getUserNotifications(req.user.id),
            this.notificationsService.getUnreadCount(req.user.id),
        ]);
        return { notifications, unreadCount };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}
