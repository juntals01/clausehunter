import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Request,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ContractsService } from './contracts.service';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
@UseGuards(AuthGuard('jwt'))
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadContract(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }
        return this.contractsService.createContract(file, req.user.id);
    }

    @Get()
    async getDashboard(@Request() req: any) {
        return this.contractsService.getDashboardContracts(req.user.id);
    }

    @Get(':id')
    async getContract(@Param('id') id: string, @Request() req: any) {
        const contract = await this.contractsService.getContract(id, req.user.id);
        if (!contract) {
            throw new HttpException('Contract not found', HttpStatus.NOT_FOUND);
        }
        return contract;
    }

    @Patch(':id')
    async updateContract(
        @Param('id') id: string,
        @Body() updateData: UpdateContractDto,
        @Request() req: any,
    ) {
        return this.contractsService.updateContract(id, updateData, req.user.id);
    }

    @Get(':id/file')
    async getContractFile(@Param('id') id: string, @Request() req: any) {
        return this.contractsService.getContractFileUrl(id, req.user.id);
    }

    @Post(':id/reprocess')
    async reprocessContract(@Param('id') id: string, @Request() req: any) {
        return this.contractsService.reprocessContract(id, req.user.id);
    }

    @Delete(':id')
    async deleteContract(@Param('id') id: string, @Request() req: any) {
        return this.contractsService.deleteContract(id, req.user.id);
    }
}
