import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateFeedbackDto) {
        return this.feedbackService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.feedbackService.getUserFeedback(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.feedbackService.getUserFeedbackById(id, req.user.id);
    }
}
