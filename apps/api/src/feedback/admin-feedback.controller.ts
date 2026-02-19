import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { FeedbackService } from './feedback.service';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';

@Controller('admin/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminFeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Get()
    findAll() {
        return this.feedbackService.getAllFeedback();
    }

    @Patch(':id')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateFeedbackStatusDto) {
        return this.feedbackService.updateStatus(id, dto);
    }
}
