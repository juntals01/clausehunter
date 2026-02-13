import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1706598000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create contracts table
        await queryRunner.createTable(
            new Table({
                name: 'contracts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'original_filename',
                        type: 'text',
                    },
                    {
                        name: 'vendor',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'notice_days',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'auto_renews',
                        type: 'boolean',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'text',
                    },
                    {
                        name: 'error_message',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'last_alerted_on',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        // Create contract_text table
        await queryRunner.createTable(
            new Table({
                name: 'contract_text',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'contract_id',
                        type: 'uuid',
                    },
                    {
                        name: 'full_text',
                        type: 'text',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        // Create foreign key
        await queryRunner.createForeignKey(
            'contract_text',
            new TableForeignKey({
                columnNames: ['contract_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'contracts',
                onDelete: 'CASCADE',
            }),
        );

        // Create unique constraint on contract_id
        await queryRunner.query(
            `ALTER TABLE contract_text ADD CONSTRAINT UQ_contract_text_contract_id UNIQUE (contract_id)`,
        );

        // Enable uuid extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('contract_text');
        await queryRunner.dropTable('contracts');
    }
}
