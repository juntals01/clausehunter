import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BlogPost } from '@expirationreminderai/database';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class BlogService {
    private readonly logger = new Logger(BlogService.name);
    private readonly bucketName = 'blog-images';

    constructor(
        @InjectRepository(BlogPost)
        private readonly blogRepo: Repository<BlogPost>,
        private readonly storageService: StorageService,
    ) {}

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 280);
    }

    private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
        let candidate = slug;
        let suffix = 1;
        while (true) {
            const existing = await this.blogRepo.findOne({ where: { slug: candidate } });
            if (!existing || existing.id === excludeId) return candidate;
            candidate = `${slug}-${suffix}`;
            suffix++;
        }
    }

    async create(authorId: string, dto: CreateBlogPostDto): Promise<BlogPost> {
        const baseSlug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.title);
        const slug = await this.ensureUniqueSlug(baseSlug);

        const post = this.blogRepo.create({
            title: dto.title,
            slug,
            excerpt: dto.excerpt || null,
            content: dto.content,
            status: dto.status || 'draft',
            publishedAt: dto.status === 'published' ? new Date() : null,
            authorId,
            metaTitle: dto.metaTitle || null,
            metaDescription: dto.metaDescription || null,
            metaKeywords: dto.metaKeywords || null,
            ogImage: dto.ogImage || null,
            canonicalUrl: dto.canonicalUrl || null,
        });

        const saved = await this.blogRepo.save(post);
        this.logger.log(`Created blog post "${saved.title}" (${saved.id})`);
        return saved;
    }

    async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
        const post = await this.blogRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException('Blog post not found');

        if (dto.title !== undefined) post.title = dto.title;
        if (dto.excerpt !== undefined) post.excerpt = dto.excerpt || null;
        if (dto.content !== undefined) post.content = dto.content;
        if (dto.metaTitle !== undefined) post.metaTitle = dto.metaTitle || null;
        if (dto.metaDescription !== undefined) post.metaDescription = dto.metaDescription || null;
        if (dto.metaKeywords !== undefined) post.metaKeywords = dto.metaKeywords || null;
        if (dto.ogImage !== undefined) post.ogImage = dto.ogImage || null;
        if (dto.canonicalUrl !== undefined) post.canonicalUrl = dto.canonicalUrl || null;

        if (dto.slug !== undefined) {
            const baseSlug = this.generateSlug(dto.slug);
            post.slug = await this.ensureUniqueSlug(baseSlug, id);
        }

        if (dto.status !== undefined) {
            if (dto.status === 'published' && post.status !== 'published') {
                post.publishedAt = new Date();
            }
            post.status = dto.status;
        }

        const saved = await this.blogRepo.save(post);
        this.logger.log(`Updated blog post "${saved.title}" (${saved.id})`);
        return saved;
    }

    async findAllAdmin(search?: string): Promise<BlogPost[]> {
        const where: any = {};
        if (search) {
            where.title = ILike(`%${search}%`);
        }

        return this.blogRepo.find({
            where,
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOneAdmin(id: string): Promise<BlogPost> {
        const post = await this.blogRepo.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!post) throw new NotFoundException('Blog post not found');
        return post;
    }

    async delete(id: string): Promise<{ deleted: boolean }> {
        const post = await this.blogRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException('Blog post not found');

        if (post.coverImage) {
            try {
                await this.storageService.deleteFile(post.coverImage);
            } catch (err) {
                this.logger.warn(`Failed to delete cover image: ${err.message}`);
            }
        }

        await this.blogRepo.remove(post);
        this.logger.log(`Deleted blog post "${post.title}"`);
        return { deleted: true };
    }

    async uploadCover(id: string, file: Express.Multer.File): Promise<BlogPost> {
        const post = await this.blogRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException('Blog post not found');

        if (post.coverImage) {
            try {
                await this.storageService.deleteFile(post.coverImage);
            } catch (err) {
                this.logger.warn(`Failed to delete old cover: ${err.message}`);
            }
        }

        const fileName = `blog/${Date.now()}-${file.originalname}`;
        await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);
        post.coverImage = fileName;
        return this.blogRepo.save(post);
    }

    async removeCover(id: string): Promise<BlogPost> {
        const post = await this.blogRepo.findOne({ where: { id } });
        if (!post) throw new NotFoundException('Blog post not found');

        if (post.coverImage) {
            try {
                await this.storageService.deleteFile(post.coverImage);
            } catch (err) {
                this.logger.warn(`Failed to delete cover: ${err.message}`);
            }
            post.coverImage = null;
            return this.blogRepo.save(post);
        }

        return post;
    }

    async getCoverUrl(coverImage: string): Promise<string> {
        return this.storageService.getFileUrl(coverImage, 86400);
    }

    // Public endpoints
    async findPublished(page: number = 1, limit: number = 12): Promise<{ posts: BlogPost[]; total: number }> {
        const [posts, total] = await this.blogRepo.findAndCount({
            where: { status: 'published' },
            relations: ['author'],
            order: { publishedAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { posts, total };
    }

    async findBySlug(slug: string): Promise<BlogPost> {
        const post = await this.blogRepo.findOne({
            where: { slug, status: 'published' },
            relations: ['author'],
        });
        if (!post) throw new NotFoundException('Blog post not found');
        return post;
    }

    async findAllPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
        return this.blogRepo.find({
            where: { status: 'published' },
            select: ['slug', 'updatedAt'],
            order: { publishedAt: 'DESC' },
        });
    }
}
