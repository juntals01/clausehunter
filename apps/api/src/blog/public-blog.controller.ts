import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class PublicBlogController {
    constructor(private readonly blogService: BlogService) {}

    @Get()
    async findAll(@Query('page') page?: string) {
        const pageNum = parseInt(page || '1', 10);
        const result = await this.blogService.findPublished(pageNum);

        const postsWithCovers = await Promise.all(
            result.posts.map(async (post) => {
                if (post.coverImage) {
                    try {
                        const coverUrl = await this.blogService.getCoverUrl(post.coverImage);
                        return { ...post, coverImageUrl: coverUrl };
                    } catch {
                        return { ...post, coverImageUrl: null };
                    }
                }
                return { ...post, coverImageUrl: null };
            }),
        );

        return { posts: postsWithCovers, total: result.total };
    }

    @Get('slugs')
    async getSlugs() {
        return this.blogService.findAllPublishedSlugs();
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string) {
        const post = await this.blogService.findBySlug(slug);
        let coverImageUrl: string | null = null;
        if (post.coverImage) {
            try {
                coverImageUrl = await this.blogService.getCoverUrl(post.coverImage);
            } catch {
                coverImageUrl = null;
            }
        }
        return { ...post, coverImageUrl };
    }
}
