import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtractionData1706603000000 implements MigrationInterface {
    name = 'AddExtractionData1706603000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contracts"
            ADD COLUMN "extraction_data" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contracts"
            DROP COLUMN "extraction_data"
        `);
    }
}
