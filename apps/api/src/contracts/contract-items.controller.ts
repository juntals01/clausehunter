import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContractItemsService } from './contract-items.service';
import { CreateContractItemDto } from './dto/create-contract-item.dto';
import { UpdateContractItemDto } from './dto/update-contract-item.dto';

@Controller('contracts/:contractId/items')
@UseGuards(AuthGuard('jwt'))
export class ContractItemsController {
    constructor(private readonly itemsService: ContractItemsService) {}

    @Get()
    async findAll(@Param('contractId') contractId: string, @Request() req: any) {
        const items = await this.itemsService.findAll(contractId, req.user.id);
        
        // Debug logging
        console.log('\n=== CONTRACT ITEMS API RESPONSE ===');
        console.log(`Total items: ${items.length}`);
        
        // Find the specific item
        const targetItem = items.find(item => item.id === '50ae8a18-f04f-4b62-9ffd-009a861a8499');
        if (targetItem) {
            console.log('\n=== ELEKTRODENSAUGGERÄT ITEM (from DB) ===');
            console.log(JSON.stringify(targetItem, null, 2));
        }
        
        // Find items with expiry date
        const itemsWithExpiry = items.filter(item => item.expiryDate != null);
        console.log(`\nItems with expiryDate: ${itemsWithExpiry.length}`);
        if (itemsWithExpiry.length > 0) {
            console.log('\n=== FIRST ITEM WITH EXPIRY DATE ===');
            console.log(JSON.stringify(itemsWithExpiry[0], null, 2));
        }
        
        return items;
    }

    @Post()
    create(
        @Param('contractId') contractId: string,
        @Body() dto: CreateContractItemDto,
        @Request() req: any,
    ) {
        return this.itemsService.create(contractId, dto, req.user.id);
    }

    @Patch(':itemId')
    update(
        @Param('contractId') contractId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateContractItemDto,
        @Request() req: any,
    ) {
        return this.itemsService.update(contractId, itemId, dto, req.user.id);
    }

    @Delete(':itemId')
    remove(
        @Param('contractId') contractId: string,
        @Param('itemId') itemId: string,
        @Request() req: any,
    ) {
        return this.itemsService.remove(contractId, itemId, req.user.id);
    }
}
