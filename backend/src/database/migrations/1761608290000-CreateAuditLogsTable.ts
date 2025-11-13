import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1761608290000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1761608290000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tipos ENUM
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_resourcetype_enum" AS ENUM('USER', 'ITEM', 'CATEGORY', 'INVENTORY', 'DISTRIBUTION', 'AUTH')`,
    );

    // Criar tabela
    await queryRunner.query(
      `CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "userName" character varying(100),
        "userEmail" character varying(50),
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "resourceType" "public"."audit_logs_resourcetype_enum" NOT NULL,
        "resourceId" uuid,
        "resourceName" text,
        "oldValues" jsonb,
        "newValues" jsonb,
        "description" text,
        "ipAddress" character varying(45),
        "userAgent" text,
        "endpoint" character varying(255),
        "method" character varying(10),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )`,
    );

    // Criar índices
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_resource" ON "audit_logs" ("resourceType", "resourceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_resource"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_userId"`);

    // Remover tabela
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);

    // Remover tipos ENUM
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."audit_logs_resourcetype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."audit_logs_action_enum"`,
    );
  }
}

