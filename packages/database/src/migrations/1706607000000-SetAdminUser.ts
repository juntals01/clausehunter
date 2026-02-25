import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAdminUser1706607000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE users SET role = 'admin' WHERE email = 'norbertoqjr@gmail.com'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE users SET role = 'user' WHERE email = 'norbertoqjr@gmail.com'`,
        );
    }
}
