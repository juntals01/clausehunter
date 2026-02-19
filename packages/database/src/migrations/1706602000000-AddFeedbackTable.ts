import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddFeedbackTable1706602000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'feedback',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'user_id', type: 'uuid' },
                    { name: 'title', type: 'varchar', length: '255' },
                    { name: 'description', type: 'text' },
                    { name: 'category', type: 'varchar', length: '50', default: "'other'" },
                    { name: 'status', type: 'varchar', length: '50', default: "'open'" },
                    { name: 'priority', type: 'varchar', length: '50', default: "'medium'" },
                    { name: 'admin_note', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'feedback',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('feedback');
        if (table) {
            const fk = table.foreignKeys.find((f) => f.columnNames.includes('user_id'));
            if (fk) await queryRunner.dropForeignKey('feedback', fk);
        }
        await queryRunner.dropTable('feedback');
    }
}
