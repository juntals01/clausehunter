import { Controller, Post, Body, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminEmailService } from './admin-email.service';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';

@Controller('admin/email')
export class AdminEmailController {
    constructor(private readonly adminEmailService: AdminEmailService) {}

    @Post('broadcast')
    @UseGuards(AuthGuard('jwt'))
    async broadcast(@Request() req: any, @Body() dto: BroadcastEmailDto) {
        // Only admins can broadcast
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }

        return this.adminEmailService.broadcastEmail(dto);
    }
}
