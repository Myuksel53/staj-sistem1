CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."basvuru_durumu" AS ENUM('basvurulacak', 'basvuruldu', 'yanit_bekleniyor', 'gorusme', 'sonuclandi');--> statement-breakpoint
CREATE TYPE "public"."dogrulama_yontemi" AS ENUM('otomatik', 'elle');--> statement-breakpoint
CREATE TYPE "public"."firsat_durumu" AS ENUM('acik', 'kapali', 'bilinmiyor');--> statement-breakpoint
CREATE TYPE "public"."firsat_turu" AS ENUM('staj', 'arastirma_staji', 'proje');--> statement-breakpoint
CREATE TYPE "public"."kabul_durumu" AS ENUM('kabul_ediyor', 'bilinmiyor', 'kabul_etmiyor');--> statement-breakpoint
CREATE TYPE "public"."kaynak_turu" AS ENUM('resmi_sayfa', 'ilan_sitesi', 'yayin_veritabani', 'kullanici_linki');--> statement-breakpoint
CREATE TYPE "public"."kurum_turu" AS ENUM('sirket', 'universite', 'enstitu');--> statement-breakpoint
CREATE TYPE "public"."kuyruk_durumu" AS ENUM('bekliyor', 'cozuldu', 'gecersiz');--> statement-breakpoint
CREATE TYPE "public"."kuyruk_nedeni" AS ENUM('icerik_degisti', 'kaynak_kayip', 'kullanici_bildirimi', 'suresi_doldu');--> statement-breakpoint
CREATE TYPE "public"."sart_turu" AS ENUM('zorunlu', 'tercih');--> statement-breakpoint
CREATE TABLE "akademisyen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad" text NOT NULL,
	"unvan" text,
	"kurum_id" uuid NOT NULL,
	"grup_id" uuid,
	"konular" text[],
	"resmi_profil_url" text,
	"eposta" text,
	"orcid" text,
	"openalex_id" text,
	"embedding" vector(384),
	CONSTRAINT "akademisyen_openalex_id_unique" UNIQUE("openalex_id")
);
--> statement-breakpoint
CREATE TABLE "arastirma_grubu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kurum_id" uuid NOT NULL,
	"ad" text NOT NULL,
	"konular" text[],
	"sayfa_url" text,
	"kabul" "kabul_durumu" DEFAULT 'bilinmiyor' NOT NULL,
	"embedding" vector(384)
);
--> statement-breakpoint
CREATE TABLE "basvuru" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"firsat_id" uuid,
	"akademisyen_id" uuid,
	"durum" "basvuru_durumu" DEFAULT 'basvurulacak' NOT NULL,
	"son_tarih" date,
	"notlar" text,
	"eposta_taslagi" text,
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beceri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"ad" text NOT NULL,
	"kategori" text,
	"duzey" text,
	"kanit" text
);
--> statement-breakpoint
CREATE TABLE "dogrulama" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"varlik_turu" text NOT NULL,
	"varlik_id" uuid NOT NULL,
	"alan" text NOT NULL,
	"deger" text,
	"alinti" text,
	"kaynak_id" uuid NOT NULL,
	"kontrol_tarihi" timestamp with time zone DEFAULT now() NOT NULL,
	"yontem" "dogrulama_yontemi" NOT NULL,
	"celiski_bayragi" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eslesme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"firsat_id" uuid,
	"akademisyen_id" uuid,
	"puan" real NOT NULL,
	"gerekce" jsonb NOT NULL,
	"karsilanan_sartlar" uuid[],
	"eksik_sartlar" uuid[],
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firsat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tur" "firsat_turu" NOT NULL,
	"kurum_id" uuid NOT NULL,
	"baslik" text NOT NULL,
	"aciklama" text,
	"sehir" text,
	"uzaktan" boolean,
	"sure_hafta" integer,
	"son_basvuru" date,
	"durum" "firsat_durumu" DEFAULT 'bilinmiyor' NOT NULL,
	"embedding" vector(384),
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hata_bildirimi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid,
	"varlik_turu" text NOT NULL,
	"varlik_id" uuid NOT NULL,
	"aciklama" text NOT NULL,
	"kuyruk_id" uuid,
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kayitli_arama" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"kriterler" jsonb NOT NULL,
	"son_calisma" timestamp with time zone,
	"bildirim" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kaynak" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"tur" "kaynak_turu" NOT NULL,
	"son_getirilme" timestamp with time zone,
	"icerik_hash" text,
	"kullanim_sarti_notu" text,
	CONSTRAINT "kaynak_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "kaynak_kutuphanesi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beceri" text NOT NULL,
	"baslik" text NOT NULL,
	"url" text NOT NULL,
	"tur" text NOT NULL,
	"sure_saat" integer,
	"son_kontrol" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kontrol_kuyrugu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"varlik_turu" text NOT NULL,
	"varlik_id" uuid NOT NULL,
	"neden" "kuyruk_nedeni" NOT NULL,
	"kaynak_id" uuid,
	"not" text,
	"durum" "kuyruk_durumu" DEFAULT 'bekliyor' NOT NULL,
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL,
	"cozulme" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kullanici_profili" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bolum" text,
	"sinif" integer,
	"ortalama" real,
	"ilgi_alanlari" text,
	"ogrenmek_istenenler" text[],
	"sehir" text,
	"uzaktan" boolean,
	"calisma_suresi_hafta" integer,
	"donem" text,
	"dil_duzeyi" jsonb,
	"ucretli" boolean,
	"zorunlu_staj" boolean,
	"ulkeler" text[],
	"ilgi_embedding" vector(384),
	"olusturma_tarihi" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kurum" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad" text NOT NULL,
	"tur" "kurum_turu" NOT NULL,
	"sehir" text,
	"ulke" text DEFAULT 'TR',
	"web_sitesi" text
);
--> statement-breakpoint
CREATE TABLE "sart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firsat_id" uuid NOT NULL,
	"metin" text NOT NULL,
	"alinti" text NOT NULL,
	"tur" "sart_turu" NOT NULL,
	"normalize_kosul" text
);
--> statement-breakpoint
CREATE TABLE "yayin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"akademisyen_id" uuid NOT NULL,
	"baslik" text NOT NULL,
	"yil" integer,
	"yazarlar" text[],
	"ozet" text,
	"konu_etiketleri" text[],
	"doi" text,
	"embedding" vector(384),
	CONSTRAINT "yayin_doi_unique" UNIQUE("doi")
);
--> statement-breakpoint
ALTER TABLE "akademisyen" ADD CONSTRAINT "akademisyen_kurum_id_kurum_id_fk" FOREIGN KEY ("kurum_id") REFERENCES "public"."kurum"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "akademisyen" ADD CONSTRAINT "akademisyen_grup_id_arastirma_grubu_id_fk" FOREIGN KEY ("grup_id") REFERENCES "public"."arastirma_grubu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arastirma_grubu" ADD CONSTRAINT "arastirma_grubu_kurum_id_kurum_id_fk" FOREIGN KEY ("kurum_id") REFERENCES "public"."kurum"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basvuru" ADD CONSTRAINT "basvuru_kullanici_id_kullanici_profili_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanici_profili"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basvuru" ADD CONSTRAINT "basvuru_firsat_id_firsat_id_fk" FOREIGN KEY ("firsat_id") REFERENCES "public"."firsat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basvuru" ADD CONSTRAINT "basvuru_akademisyen_id_akademisyen_id_fk" FOREIGN KEY ("akademisyen_id") REFERENCES "public"."akademisyen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beceri" ADD CONSTRAINT "beceri_kullanici_id_kullanici_profili_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanici_profili"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dogrulama" ADD CONSTRAINT "dogrulama_kaynak_id_kaynak_id_fk" FOREIGN KEY ("kaynak_id") REFERENCES "public"."kaynak"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eslesme" ADD CONSTRAINT "eslesme_kullanici_id_kullanici_profili_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanici_profili"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eslesme" ADD CONSTRAINT "eslesme_firsat_id_firsat_id_fk" FOREIGN KEY ("firsat_id") REFERENCES "public"."firsat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eslesme" ADD CONSTRAINT "eslesme_akademisyen_id_akademisyen_id_fk" FOREIGN KEY ("akademisyen_id") REFERENCES "public"."akademisyen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firsat" ADD CONSTRAINT "firsat_kurum_id_kurum_id_fk" FOREIGN KEY ("kurum_id") REFERENCES "public"."kurum"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hata_bildirimi" ADD CONSTRAINT "hata_bildirimi_kullanici_id_kullanici_profili_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanici_profili"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hata_bildirimi" ADD CONSTRAINT "hata_bildirimi_kuyruk_id_kontrol_kuyrugu_id_fk" FOREIGN KEY ("kuyruk_id") REFERENCES "public"."kontrol_kuyrugu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kayitli_arama" ADD CONSTRAINT "kayitli_arama_kullanici_id_kullanici_profili_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanici_profili"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kontrol_kuyrugu" ADD CONSTRAINT "kontrol_kuyrugu_kaynak_id_kaynak_id_fk" FOREIGN KEY ("kaynak_id") REFERENCES "public"."kaynak"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sart" ADD CONSTRAINT "sart_firsat_id_firsat_id_fk" FOREIGN KEY ("firsat_id") REFERENCES "public"."firsat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yayin" ADD CONSTRAINT "yayin_akademisyen_id_akademisyen_id_fk" FOREIGN KEY ("akademisyen_id") REFERENCES "public"."akademisyen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dogrulama_varlik_idx" ON "dogrulama" USING btree ("varlik_turu","varlik_id");--> statement-breakpoint
CREATE INDEX "kuyruk_durum_idx" ON "kontrol_kuyrugu" USING btree ("durum");