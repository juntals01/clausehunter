import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetTokenColumns1706604000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires timestamp NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expires`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS reset_token`);
    }
}
