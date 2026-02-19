import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarColumn1706601000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN avatar varchar(500) NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP COLUMN avatar`,
        );
    }
}
