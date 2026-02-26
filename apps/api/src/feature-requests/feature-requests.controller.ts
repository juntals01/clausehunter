import { Controller, Get, Post, Param, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureRequestsService } from './feature-requests.service';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';

@Controller('feature-requests')
export class FeatureRequestsController {
    constructor(
        private readonly featureRequestsService: FeatureRequestsService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    @Get()
    async findAll(@Headers('authorization') authHeader?: string) {
        let userId: string | undefined;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const secret = this.configService.get('JWT_SECRET', 'default-secret');
                const decoded = this.jwtService.verify(token, { secret });
                userId = decoded.sub;
            } catch {
                // Invalid token — still return public list
            }
        }
        return this.featureRequestsService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.featureRequestsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req: any, @Body() dto: CreateFeatureRequestDto) {
        return this.featureRequestsService.create(req.user.id, dto);
    }

    @Post(':id/vote')
    @UseGuards(JwtAuthGuard)
    toggleVote(@Request() req: any, @Param('id') id: string) {
        return this.featureRequestsService.toggleVote(id, req.user.id);
    }
}
