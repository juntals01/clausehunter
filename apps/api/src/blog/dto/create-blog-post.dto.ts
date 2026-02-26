import { IsString, IsNotEmpty, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateBlogPostDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    slug?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsString()
    @IsNotEmpty()
    content!: string;

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
