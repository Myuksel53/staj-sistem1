ALTER TABLE "kurum" ADD COLUMN "openalex_id" text;--> statement-breakpoint
ALTER TABLE "kurum" ADD CONSTRAINT "kurum_openalex_id_unique" UNIQUE("openalex_id");