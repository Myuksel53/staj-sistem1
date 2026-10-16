CREATE TABLE "kayitli_firsat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"firsat_id" uuid NOT NULL,
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kayitli_firsat" ADD CONSTRAINT "kayitli_firsat_firsat_id_firsat_id_fk" FOREIGN KEY ("firsat_id") REFERENCES "public"."firsat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kayitli_firsat_tekil" ON "kayitli_firsat" USING btree ("kullanici_id","firsat_id");--> statement-breakpoint
CREATE INDEX "kayitli_firsat_kullanici_idx" ON "kayitli_firsat" USING btree ("kullanici_id");