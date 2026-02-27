import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentCategoryAndTitle1706610000000 implements MigrationInterface {
    name = 'AddDocumentCategoryAndTitle1706610000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contracts"
            ADD COLUMN "title" text,
            ADD COLUMN "category" text NOT NULL DEFAULT 'contract'
        `);

        await queryRunner.query(`
            ALTER TABLE "contracts"
            ALTER COLUMN "original_filename" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "contracts" SET "original_filename" = 'unknown' WHERE "original_filename" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "contracts"
            ALTER COLUMN "original_filename" SET NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "contracts"
            DROP COLUMN "category",
            DROP COLUMN "title"
        `);
    }
}
