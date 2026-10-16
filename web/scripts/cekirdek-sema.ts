import { z } from "zod";

export const Kayit = z.object({
  kurum: z.object({
    ad: z.string().min(1),
    tur: z.enum(["sirket", "universite", "enstitu"]),
    sehir: z.string().optional(),
    ulke: z.string().default("TR"),
    webSitesi: z.string().url().optional(),
  }),
  tur: z.enum(["staj", "arastirma_staji", "proje"]),
  baslik: z.string().min(1),
  aciklama: z.string().min(30),
  sehir: z.string().optional(),
  uzaktan: z.boolean().optional(),
  sureHafta: z.number().int().positive().optional(),
  sonBasvuru: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  durum: z.enum(["acik", "kapali", "bilinmiyor"]),
  kaynak: z.object({
    url: z.string().url(),
    tur: z.enum(["resmi_sayfa", "ilan_sitesi", "yayin_veritabani", "kullanici_linki"]),
    kullanimSartiNotu: z.string().optional(),
  }),
  dogrulamaYontemi: z.enum(["elle", "otomatik"]).default("elle"), // kaydı insan mı okudu, yazılım mı
});
export const Grup = z.object({
  kurum: Kayit.shape.kurum,
  ad: z.string().min(1),
  konular: z.array(z.string()).min(1),
  sayfaUrl: z.string().url(),
  kabul: z.enum(["kabul_ediyor", "bilinmiyor", "kabul_etmiyor"]).default("bilinmiyor"),
  kaynak: Kayit.shape.kaynak,
  dogrulamaYontemi: z.enum(["elle", "otomatik"]).default("elle"),
});
export const Cekirdek = z.object({ kayitlar: z.array(Kayit).default([]), gruplar: z.array(Grup).default([]) });
export type GrupTipi = z.infer<typeof Grup>;
export type KayitTipi = z.infer<typeof Kayit>;
