import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuth1706600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add google_id column
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN google_id varchar(255) NULL UNIQUE`,
        );

        // Make password_hash nullable (for OAuth-only users)
        await queryRunner.query(
            `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE users DROP COLUMN google_id`,
        );
    }
}
