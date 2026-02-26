import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class AddFeatureRequestsTables1706609000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'feature_requests',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'title', type: 'varchar', length: '255' },
                    { name: 'description', type: 'text' },
                    { name: 'status', type: 'varchar', length: '50', default: "'open'" },
                    { name: 'vote_count', type: 'int', default: 0 },
                    { name: 'user_id', type: 'uuid' },
                    { name: 'admin_response', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'feature_requests',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'feature_request_votes',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'feature_request_id', type: 'uuid' },
                    { name: 'user_id', type: 'uuid' },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createUniqueConstraint(
            'feature_request_votes',
            new TableUnique({
                name: 'UQ_feature_request_vote_user',
                columnNames: ['feature_request_id', 'user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'feature_request_votes',
            new TableForeignKey({
                columnNames: ['feature_request_id'],
                referencedTableName: 'feature_requests',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'feature_request_votes',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const votesTable = await queryRunner.getTable('feature_request_votes');
        if (votesTable) {
            for (const fk of votesTable.foreignKeys) {
                await queryRunner.dropForeignKey('feature_request_votes', fk);
            }
        }
        await queryRunner.dropTable('feature_request_votes');

        const requestsTable = await queryRunner.getTable('feature_requests');
        if (requestsTable) {
            for (const fk of requestsTable.foreignKeys) {
                await queryRunner.dropForeignKey('feature_requests', fk);
            }
        }
        await queryRunner.dropTable('feature_requests');
    }
}
