import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732533796138 implements MigrationInterface {
    name = 'Migration1732533796138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "applicant" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "studyDirectionId" uuid NOT NULL,
                "instituteId" uuid NOT NULL,
                CONSTRAINT "PK_f4a6e907b8b17f293eb073fc5ea" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "institute" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "address" character varying NOT NULL,
                CONSTRAINT "PK_0805fd7b49c18ad55f0646dcbbb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "department" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "instituteId" uuid NOT NULL,
                CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "study_direction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "departmentId" uuid NOT NULL,
                CONSTRAINT "PK_96a304d46609b2287a697b2137e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "dormitory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "capacity" integer NOT NULL,
                "buildingId" uuid NOT NULL,
                CONSTRAINT "PK_17483b11457c23cad87f30ff31c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "building" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "address" character varying NOT NULL,
                CONSTRAINT "PK_bbfaf6c11f141a22d2ab105ee5f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "applicant"
            ADD CONSTRAINT "FK_06086bfce24913f8f9e9d765eac" FOREIGN KEY ("studyDirectionId") REFERENCES "study_direction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "applicant"
            ADD CONSTRAINT "FK_1c77d1085c8095991b1db77d2fb" FOREIGN KEY ("instituteId") REFERENCES "institute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "department"
            ADD CONSTRAINT "FK_1c8bc31989a5719cf37e014bafa" FOREIGN KEY ("instituteId") REFERENCES "institute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "study_direction"
            ADD CONSTRAINT "FK_1c78ea22626e1f63fb5236ec133" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "dormitory"
            ADD CONSTRAINT "FK_a3024291a8de1ecf3a54eb1a8d5" FOREIGN KEY ("buildingId") REFERENCES "building"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "dormitory" DROP CONSTRAINT "FK_a3024291a8de1ecf3a54eb1a8d5"
        `);
        await queryRunner.query(`
            ALTER TABLE "study_direction" DROP CONSTRAINT "FK_1c78ea22626e1f63fb5236ec133"
        `);
        await queryRunner.query(`
            ALTER TABLE "department" DROP CONSTRAINT "FK_1c8bc31989a5719cf37e014bafa"
        `);
        await queryRunner.query(`
            ALTER TABLE "applicant" DROP CONSTRAINT "FK_1c77d1085c8095991b1db77d2fb"
        `);
        await queryRunner.query(`
            ALTER TABLE "applicant" DROP CONSTRAINT "FK_06086bfce24913f8f9e9d765eac"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "building"
        `);
        await queryRunner.query(`
            DROP TABLE "dormitory"
        `);
        await queryRunner.query(`
            DROP TABLE "study_direction"
        `);
        await queryRunner.query(`
            DROP TABLE "department"
        `);
        await queryRunner.query(`
            DROP TABLE "institute"
        `);
        await queryRunner.query(`
            DROP TABLE "applicant"
        `);
    }

}
