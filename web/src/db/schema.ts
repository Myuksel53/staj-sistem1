import {
  pgTable, pgEnum, uuid, text, integer, real, boolean, timestamp, date, jsonb, vector, index, uniqueIndex,
} from "drizzle-orm/pg-core";

// Enum'lar
export const kurumTuru = pgEnum("kurum_turu", ["sirket", "universite", "enstitu"]);
export const kabulDurumu = pgEnum("kabul_durumu", ["kabul_ediyor", "bilinmiyor", "kabul_etmiyor"]);
export const firsatTuru = pgEnum("firsat_turu", ["staj", "arastirma_staji", "proje"]);
export const firsatDurumu = pgEnum("firsat_durumu", ["acik", "kapali", "bilinmiyor"]);
export const sartTuru = pgEnum("sart_turu", ["zorunlu", "tercih"]);
export const kaynakTuru = pgEnum("kaynak_turu", ["resmi_sayfa", "ilan_sitesi", "yayin_veritabani", "kullanici_linki"]);
export const dogrulamaYontemi = pgEnum("dogrulama_yontemi", ["otomatik", "elle"]);
export const basvuruDurumu = pgEnum("basvuru_durumu", [
  "basvurulacak", "basvuruldu", "yanit_bekleniyor", "gorusme", "sonuclandi",
]);

const id = () => uuid("id").primaryKey().defaultRandom();
const olusturma = () => timestamp("olusturma_tarihi", { withTimezone: true }).defaultNow().notNull();
const EMBED_DIM = 384; // multilingual-e5-small; model değişirse migration yeniden üretilmeli

// --- Kaynak ve Doğrulama: modelin merkezi ---
export const kaynak = pgTable("kaynak", {
  id: id(),
  url: text("url").notNull().unique(),
  tur: kaynakTuru("tur").notNull(),
  sonGetirilme: timestamp("son_getirilme", { withTimezone: true }),
  icerikHash: text("icerik_hash"),
  kullanimSartiNotu: text("kullanim_sarti_notu"), // scraping izni / ToS kaydı
});

export const dogrulama = pgTable("dogrulama", {
  id: id(),
  varlikTuru: text("varlik_turu").notNull(), // "firsat", "akademisyen", ...
  varlikId: uuid("varlik_id").notNull(),
  alan: text("alan").notNull(),
  deger: text("deger"),
  alinti: text("alinti"), // LLM çıkarımı için kaynak metinden cümle
  kaynakId: uuid("kaynak_id").references(() => kaynak.id).notNull(),
  kontrolTarihi: timestamp("kontrol_tarihi", { withTimezone: true }).defaultNow().notNull(),
  yontem: dogrulamaYontemi("yontem").notNull(),
  celiskiBayragi: boolean("celiski_bayragi").default(false).notNull(),
}, (t) => [index("dogrulama_varlik_idx").on(t.varlikTuru, t.varlikId)]);

// --- Kullanıcı ---
export const kullaniciProfili = pgTable("kullanici_profili", {
  id: uuid("id").primaryKey(), // Supabase auth.users.id
  bolum: text("bolum"),
  sinif: integer("sinif"),
  ortalama: real("ortalama"),
  ilgiAlanlari: text("ilgi_alanlari"),
  ogrenmekIstenenler: text("ogrenmek_istenenler").array(),
  sehir: text("sehir"),
  uzaktan: boolean("uzaktan"),
  calismaSuresiHafta: integer("calisma_suresi_hafta"),
  donem: text("donem"),
  dilDuzeyi: jsonb("dil_duzeyi"),
  ucretli: boolean("ucretli"),
  zorunluStaj: boolean("zorunlu_staj"),
  ulkeler: text("ulkeler").array(), // tercih edilen ülke kodları (ör. TR, DE); boşsa fark etmez
  ilgiEmbedding: vector("ilgi_embedding", { dimensions: EMBED_DIM }),
  olusturma: olusturma(),
});

export const beceri = pgTable("beceri", {
  id: id(),
  kullaniciId: uuid("kullanici_id").references(() => kullaniciProfili.id, { onDelete: "cascade" }).notNull(),
  ad: text("ad").notNull(),
  kategori: text("kategori"),
  duzey: text("duzey"),
  kanit: text("kanit"), // proje, sertifika, ders; e-postada yalnızca kanıtlılar kullanılır
});

// --- Kurum / grup / kişi ---
export const kurum = pgTable("kurum", {
  id: id(),
  ad: text("ad").notNull(),
  tur: kurumTuru("tur").notNull(),
  sehir: text("sehir"),
  ulke: text("ulke").default("TR"),
  webSitesi: text("web_sitesi"),
  openalexId: text("openalex_id").unique(), // https://openalex.org/I…; yalnızca OpenAlex'ten gelen kurumlarda
});

export const arastirmaGrubu = pgTable("arastirma_grubu", {
  id: id(),
  kurumId: uuid("kurum_id").references(() => kurum.id).notNull(),
  ad: text("ad").notNull(),
  konular: text("konular").array(),
  sayfaUrl: text("sayfa_url"),
  kabul: kabulDurumu("kabul").default("bilinmiyor").notNull(),
  embedding: vector("embedding", { dimensions: EMBED_DIM }),
});

export const akademisyen = pgTable("akademisyen", {
  id: id(),
  ad: text("ad").notNull(),
  unvan: text("unvan"),
  kurumId: uuid("kurum_id").references(() => kurum.id).notNull(),
  grupId: uuid("grup_id").references(() => arastirmaGrubu.id),
  konular: text("konular").array(),
  resmiProfilUrl: text("resmi_profil_url"),
  eposta: text("eposta"), // yalnızca resmî sayfada yayımlanmışsa
  orcid: text("orcid"),
  openalexId: text("openalex_id").unique(),
  embedding: vector("embedding", { dimensions: EMBED_DIM }),
});

export const yayin = pgTable("yayin", {
  id: id(),
  akademisyenId: uuid("akademisyen_id").references(() => akademisyen.id).notNull(),
  baslik: text("baslik").notNull(),
  yil: integer("yil"),
  yazarlar: text("yazarlar").array(),
  ozet: text("ozet"),
  konuEtiketleri: text("konu_etiketleri").array(),
  doi: text("doi").unique(),
  embedding: vector("embedding", { dimensions: EMBED_DIM }),
});

// --- Fırsat ve şartlar ---
export const firsat = pgTable("firsat", {
  id: id(),
  tur: firsatTuru("tur").notNull(),
  kurumId: uuid("kurum_id").references(() => kurum.id).notNull(),
  baslik: text("baslik").notNull(),
  aciklama: text("aciklama"),
  sehir: text("sehir"),
  uzaktan: boolean("uzaktan"),
  sureHafta: integer("sure_hafta"),
  sonBasvuru: date("son_basvuru"),
  durum: firsatDurumu("durum").default("bilinmiyor").notNull(),
  embedding: vector("embedding", { dimensions: EMBED_DIM }),
  olusturma: olusturma(),
});

export const sart = pgTable("sart", {
  id: id(),
  firsatId: uuid("firsat_id").references(() => firsat.id, { onDelete: "cascade" }).notNull(),
  metin: text("metin").notNull(),
  alinti: text("alinti").notNull(), // alıntısız şart saklanmaz
  tur: sartTuru("tur").notNull(),
  normalizeKosul: text("normalize_kosul"),
});

// --- Eşleşme, başvuru, kayıtlı arama ---
export const eslesme = pgTable("eslesme", {
  id: id(),
  kullaniciId: uuid("kullanici_id").references(() => kullaniciProfili.id, { onDelete: "cascade" }).notNull(),
  firsatId: uuid("firsat_id").references(() => firsat.id),
  akademisyenId: uuid("akademisyen_id").references(() => akademisyen.id),
  puan: real("puan").notNull(),
  gerekce: jsonb("gerekce").notNull(), // [{metin, alinti, kaynakId}]
  karsilananSartlar: uuid("karsilanan_sartlar").array(),
  eksikSartlar: uuid("eksik_sartlar").array(),
  olusturma: olusturma(),
});

export const basvuru = pgTable("basvuru", {
  id: id(),
  kullaniciId: uuid("kullanici_id").references(() => kullaniciProfili.id, { onDelete: "cascade" }).notNull(),
  firsatId: uuid("firsat_id").references(() => firsat.id),
  akademisyenId: uuid("akademisyen_id").references(() => akademisyen.id),
  durum: basvuruDurumu("durum").default("basvurulacak").notNull(),
  sonTarih: date("son_tarih"),
  notlar: text("notlar"),
  epostaTaslagi: text("eposta_taslagi"),
  olusturma: olusturma(),
});

/** Kullanıcının kaydettiği (favori) programlar. Profil satırına bağlı DEĞİL: yeni kayıt olan, henüz profil doldurmamış kullanıcı da kaydedebilsin.
 *  Hesap silinirken `hesapSil` bu tabloyu açıkça temizler. */
export const kayitliFirsat = pgTable("kayitli_firsat", {
  id: id(),
  kullaniciId: uuid("kullanici_id").notNull(),
  firsatId: uuid("firsat_id").references(() => firsat.id, { onDelete: "cascade" }).notNull(),
  olusturma: olusturma(),
}, (t) => [uniqueIndex("kayitli_firsat_tekil").on(t.kullaniciId, t.firsatId), index("kayitli_firsat_kullanici_idx").on(t.kullaniciId)]);

export const kayitliArama = pgTable("kayitli_arama", { // Faz 2
  id: id(),
  kullaniciId: uuid("kullanici_id").references(() => kullaniciProfili.id, { onDelete: "cascade" }).notNull(),
  kriterler: jsonb("kriterler").notNull(),
  sonCalisma: timestamp("son_calisma", { withTimezone: true }),
  bildirim: boolean("bildirim").default(false).notNull(),
});

// --- Faz 2 ---
// Elle derlenen kaynak/mini proje kütüphanesi: yol haritası yalnızca buradaki kayıtlara bağlanır, link uydurulmaz.
export const kaynakKutuphanesi = pgTable("kaynak_kutuphanesi", {
  id: id(),
  beceri: text("beceri").notNull(), // normalizeKosul'daki "beceri:x" ile aynı, küçük harf
  baslik: text("baslik").notNull(),
  url: text("url").notNull(),
  tur: text("tur").notNull(), // kurs, dokuman, mini_proje
  sureSaat: integer("sure_saat"),
  sonKontrol: timestamp("son_kontrol", { withTimezone: true }),
});

// --- Faz 3 ---
export const kuyrukNedeni = pgEnum("kuyruk_nedeni", ["icerik_degisti", "kaynak_kayip", "kullanici_bildirimi", "suresi_doldu"]);
export const kuyrukDurumu = pgEnum("kuyruk_durumu", ["bekliyor", "cozuldu", "gecersiz"]);

// Doğrulama kuralı 3 ve 6: değişen/kaybolan kaynak ve kullanıcı bildirimleri buraya düşer.
export const kontrolKuyrugu = pgTable("kontrol_kuyrugu", {
  id: id(),
  varlikTuru: text("varlik_turu").notNull(), // "firsat" | "grup" | "akademisyen"
  varlikId: uuid("varlik_id").notNull(),
  neden: kuyrukNedeni("neden").notNull(),
  kaynakId: uuid("kaynak_id").references(() => kaynak.id),
  not: text("not"),
  durum: kuyrukDurumu("durum").default("bekliyor").notNull(),
  olusturma: olusturma(),
  cozulme: timestamp("cozulme", { withTimezone: true }),
}, (t) => [index("kuyruk_durum_idx").on(t.durum)]);

export const hataBildirimi = pgTable("hata_bildirimi", {
  id: id(),
  kullaniciId: uuid("kullanici_id").references(() => kullaniciProfili.id, { onDelete: "set null" }),
  varlikTuru: text("varlik_turu").notNull(),
  varlikId: uuid("varlik_id").notNull(),
  aciklama: text("aciklama").notNull(),
  kuyrukId: uuid("kuyruk_id").references(() => kontrolKuyrugu.id),
  olusturma: olusturma(),
});
