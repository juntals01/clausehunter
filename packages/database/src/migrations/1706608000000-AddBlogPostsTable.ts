import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddBlogPostsTable1706608000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'blog_posts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'title', type: 'varchar', length: '255' },
                    { name: 'slug', type: 'varchar', length: '300', isUnique: true },
                    { name: 'excerpt', type: 'text', isNullable: true },
                    { name: 'content', type: 'text' },
                    { name: 'cover_image', type: 'varchar', length: '500', isNullable: true },
                    { name: 'status', type: 'varchar', length: '20', default: "'draft'" },
                    { name: 'published_at', type: 'timestamp', isNullable: true },
                    { name: 'author_id', type: 'uuid' },
                    { name: 'meta_title', type: 'varchar', length: '255', isNullable: true },
                    { name: 'meta_description', type: 'varchar', length: '500', isNullable: true },
                    { name: 'meta_keywords', type: 'varchar', length: '500', isNullable: true },
                    { name: 'og_image', type: 'varchar', length: '500', isNullable: true },
                    { name: 'canonical_url', type: 'varchar', length: '500', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'blog_posts',
            new TableIndex({
                name: 'IDX_blog_posts_slug',
                columnNames: ['slug'],
                isUnique: true,
            }),
        );

        await queryRunner.createForeignKey(
            'blog_posts',
            new TableForeignKey({
                columnNames: ['author_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('blog_posts');
        if (table) {
            const fk = table.foreignKeys.find((f) => f.columnNames.includes('author_id'));
            if (fk) await queryRunner.dropForeignKey('blog_posts', fk);
        }
        await queryRunner.dropIndex('blog_posts', 'IDX_blog_posts_slug');
        await queryRunner.dropTable('blog_posts');
    }
}
