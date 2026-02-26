import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('blog_posts')
export class BlogPost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 300, unique: true })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    excerpt!: string | null;

    @Column({ type: 'text' })
    content!: string;

    @Column({ name: 'cover_image', type: 'varchar', length: 500, nullable: true })
    coverImage!: string | null;

    @Column({ type: 'varchar', length: 20, default: 'draft' })
    status!: string; // 'draft' | 'published'

    @Column({ name: 'published_at', type: 'timestamp', nullable: true })
    publishedAt!: Date | null;

    @Column({ name: 'author_id', type: 'uuid' })
    authorId!: string;

    // SEO fields
    @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
    metaTitle!: string | null;

    @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
    metaDescription!: string | null;

    @Column({ name: 'meta_keywords', type: 'varchar', length: 500, nullable: true })
    metaKeywords!: string | null;

    @Column({ name: 'og_image', type: 'varchar', length: 500, nullable: true })
    ogImage!: string | null;

    @Column({ name: 'canonical_url', type: 'varchar', length: 500, nullable: true })
    canonicalUrl!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author?: User;
}
