import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class UpdateBlogPostDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    slug?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    @IsIn(['draft', 'published'])
    status?: string;

    // SEO fields
    @IsOptional()
    @IsString()
    @MaxLength(255)
    metaTitle?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    metaDescription?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    metaKeywords?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    ogImage?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    canonicalUrl?: string;
}
