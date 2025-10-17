CREATE TABLE "soc_companies" (
  "id" text PRIMARY KEY NOT NULL,
  "soc_code" varchar(50),
  "name" varchar(255) NOT NULL,
  "company_name" varchar(255) NOT NULL,
  "cnpj" varchar(18),
  "caepf" varchar(20),
  "address" text,
  "cnae" varchar(20),
  "risk_degree" varchar(1),
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp
);

--> statement-breakpoint
CREATE TABLE "soc_jobs" (
  "id" text PRIMARY KEY NOT NULL,
  "soc_code" varchar(50),
  "soc_company_code" varchar(50),
  "name" varchar(255) NOT NULL,
  "detailed_description" text,
  "sector_id" text NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp
);

--> statement-breakpoint
CREATE TABLE "soc_sectors" (
  "id" text PRIMARY KEY NOT NULL,
  "soc_code" varchar(50),
  "soc_company_code" varchar(50),
  "name" varchar(255) NOT NULL,
  "unit_id" text NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp
);

--> statement-breakpoint
CREATE TABLE "soc_units" (
  "id" text PRIMARY KEY NOT NULL,
  "soc_code" varchar(50),
  "soc_company_code" varchar(50),
  "name" varchar(255) NOT NULL,
  "company_name" varchar(255) NOT NULL,
  "cnpj" varchar(18),
  "cpf" varchar(14),
  "caepf" varchar(20),
  "address" text,
  "cnae" varchar(20),
  "risk_degree" varchar(1),
  "company_id" text NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp
);

--> statement-breakpoint
ALTER TABLE
  "soc_jobs"
ADD
  CONSTRAINT "soc_jobs_sector_id_soc_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."soc_sectors"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE
  "soc_sectors"
ADD
  CONSTRAINT "soc_sectors_unit_id_soc_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."soc_units"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE
  "soc_units"
ADD
  CONSTRAINT "soc_units_company_id_soc_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."soc_companies"("id") ON DELETE cascade ON UPDATE no action;