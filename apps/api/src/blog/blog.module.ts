import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from '@expirationreminderai/database';
import { BlogService } from './blog.service';
import { AdminBlogController } from './admin-blog.controller';
import { PublicBlogController } from './public-blog.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlogPost]),
        StorageModule,
    ],
    controllers: [AdminBlogController, PublicBlogController],
    providers: [BlogService],
    exports: [BlogService],
})
export class BlogModule {}
