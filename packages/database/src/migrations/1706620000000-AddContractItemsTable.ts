import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContractItemsTable1706620000000 implements MigrationInterface {
    name = 'AddContractItemsTable1706620000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "contract_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "contract_id" uuid NOT NULL,
                "name" text NOT NULL,
                "description" text,
                "expiry_date" date,
                "notice_days" integer,
                "status" text NOT NULL DEFAULT 'active',
                "source_text" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_contract_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_contract_items_contract" FOREIGN KEY ("contract_id")
                    REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_contract_items_contract_id" ON "contract_items" ("contract_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_contract_items_contract_id"`);
        await queryRunner.query(`DROP TABLE "contract_items"`);
    }
}
