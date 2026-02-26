import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { FeatureRequestsService } from './feature-requests.service';
import { UpdateFeatureRequestStatusDto } from './dto/update-feature-request-status.dto';

@Controller('admin/feature-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminFeatureRequestsController {
    constructor(private readonly featureRequestsService: FeatureRequestsService) {}

    @Get()
    findAll() {
        return this.featureRequestsService.findAll();
    }

    @Patch(':id')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateFeatureRequestStatusDto) {
        return this.featureRequestsService.updateStatus(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.featureRequestsService.remove(id);
    }
}
