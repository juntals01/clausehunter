import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddMissingColumnsAndTables1706605000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add stored_filename to contracts
        await queryRunner.query(
            `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS stored_filename text NULL`,
        );

        // Create notifications table
        await queryRunner.createTable(
            new Table({
                name: 'notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'user_id', type: 'uuid' },
                    { name: 'type', type: 'varchar', length: '50' },
                    { name: 'title', type: 'varchar', length: '255' },
                    { name: 'message', type: 'text' },
                    { name: 'contract_id', type: 'uuid', isNullable: true },
                    { name: 'read', type: 'boolean', default: false },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'notifications',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notifications');
        await queryRunner.query(`ALTER TABLE contracts DROP COLUMN IF EXISTS stored_filename`);
    }
}
