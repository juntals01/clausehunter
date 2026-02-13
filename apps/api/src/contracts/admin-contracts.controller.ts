import {
    Controller,
    Get,
    Delete,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { ContractsService } from './contracts.service';

@Controller('admin/contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @Get()
    async getAll() {
        return this.contractsService.getAllContracts();
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.contractsService.deleteContractAdmin(id);
    }
}
