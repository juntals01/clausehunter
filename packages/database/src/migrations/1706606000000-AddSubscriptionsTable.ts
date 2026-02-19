import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddSubscriptionsTable1706606000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'subscriptions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'user_id', type: 'uuid' },
                    { name: 'ls_customer_id', type: 'varchar', length: '255', isNullable: true },
                    { name: 'ls_subscription_id', type: 'varchar', length: '255', isUnique: true },
                    { name: 'ls_order_id', type: 'varchar', length: '255', isNullable: true },
                    { name: 'product_id', type: 'varchar', length: '255', isNullable: true },
                    { name: 'variant_id', type: 'varchar', length: '255', isNullable: true },
                    { name: 'status', type: 'varchar', length: '50', default: "'active'" },
                    { name: 'plan_name', type: 'varchar', length: '50', default: "'free'" },
                    { name: 'card_brand', type: 'varchar', length: '50', isNullable: true },
                    { name: 'card_last_four', type: 'varchar', length: '4', isNullable: true },
                    { name: 'trial_ends_at', type: 'timestamp', isNullable: true },
                    { name: 'renews_at', type: 'timestamp', isNullable: true },
                    { name: 'ends_at', type: 'timestamp', isNullable: true },
                    { name: 'update_payment_method_url', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp', default: 'now()' },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'subscriptions',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('subscriptions');
        if (table) {
            const fk = table.foreignKeys.find((f) => f.columnNames.includes('user_id'));
            if (fk) await queryRunner.dropForeignKey('subscriptions', fk);
        }
        await queryRunner.dropTable('subscriptions');
    }
}
