import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesSchema1728156273502 implements MigrationInterface {
  name = 'CreateTablesSchema1728156273502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "visitors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "ticketNumber" integer,
        "status" character varying NOT NULL DEFAULT 'queued',
        CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_service_name" UNIQUE ("name"),
        CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "issueDate" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'queued',
        "serviceId" uuid,
        "visitorId" uuid,
        CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"),
        CONSTRAINT "FK_serviceId" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_visitorId" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    );

    await queryRunner.query(
      `INSERT INTO "services" ("name") VALUES
      ('Тестирование русского языка'),
      ('Тестирование английского языка')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_visitorId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_serviceId"`,
    );

    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "visitors"`);
  }
}
