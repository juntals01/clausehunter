import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Get('count')
    count() {
        return this.usersService.count();
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.usersService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Post(':id/impersonate')
    async impersonate(@Param('id') id: string) {
        const user = await this.authService.validateUser(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            ...this.authService.generateToken(user),
            user: this.authService.sanitizeUser(user),
        };
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
