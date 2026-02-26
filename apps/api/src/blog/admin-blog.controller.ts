import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Request,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminBlogController {
    constructor(private readonly blogService: BlogService) {}

    @Post()
    create(@Request() req: any, @Body() dto: CreateBlogPostDto) {
        return this.blogService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.blogService.findAllAdmin(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogService.findOneAdmin(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
        return this.blogService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.blogService.delete(id);
    }

    @Post(':id/cover')
    @UseInterceptors(FileInterceptor('file'))
    uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }
        return this.blogService.uploadCover(id, file);
    }

    @Delete(':id/cover')
    removeCover(@Param('id') id: string) {
        return this.blogService.removeCover(id);
    }
}
