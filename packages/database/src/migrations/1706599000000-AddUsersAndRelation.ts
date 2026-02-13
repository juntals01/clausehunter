import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddUsersAndRelation1706599000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'name', type: 'varchar', length: '255' },
                    { name: 'email', type: 'varchar', length: '255', isUnique: true },
                    { name: 'password_hash', type: 'varchar', length: '255' },
                    { name: 'role', type: 'varchar', length: '50', default: "'user'" },
                    { name: 'status', type: 'varchar', length: '50', default: "'active'" },
                    { name: 'company', type: 'varchar', length: '255', isNullable: true },
                    { name: 'last_active_at', type: 'timestamp', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        // Add user_id column to contracts
        await queryRunner.query(
            `ALTER TABLE contracts ADD COLUMN user_id uuid NULL`,
        );

        // Add foreign key
        await queryRunner.createForeignKey(
            'contracts',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('contracts');
        const fk = table?.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
        if (fk) await queryRunner.dropForeignKey('contracts', fk);
        await queryRunner.query(`ALTER TABLE contracts DROP COLUMN user_id`);
        await queryRunner.dropTable('users');
    }
}
