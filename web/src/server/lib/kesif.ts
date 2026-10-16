import { and, asc, cosineDistance, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { arastirmaGrubu, dogrulama, firsat, kaynak, kurum } from "@/db/schema";
import { embed } from "./ai/embed";
import { hocaBul } from "./hocabul";
import { etkinDurum } from "./freshness";
import { kalanGun } from "./tarih";
import { anahtarGecer, anahtarlar, bagilGecer } from "./konu";

export const KONULAR = [
  "Makine öğrenmesi", "Yapay zeka", "Görüntü işleme", "Gömülü sistemler", "Robotik",
  "Siber güvenlik", "Yazılım geliştirme", "Veri bilimi", "Haberleşme", "Güç elektroniği", "FPGA / sayısal tasarım",
];

/** Girişsiz keşif: seçilen konular + serbest metin → vektör benzerliğiyle ilan ve laboratuvar. Kullanıcı verisi yazılmaz. */
export type KesifFiltre = { tur: "" | "staj" | "arastirma_staji" | "proje"; sadeceAcik: boolean; demoGizle: boolean; tumu?: boolean };
export const TURLER = { staj: "Staj", arastirma_staji: "Araştırma stajı", proje: "Proje desteği" } as const;

export async function kesif(konular: string[], serbest: string, sehir: string, filtre: KesifFiltre = { tur: "", sadeceAcik: false, demoGizle: false }) {
  const metin = [...konular, serbest].map((s) => s.trim()).filter(Boolean).join(", ");
  if (!metin) return null;
  const [v] = await embed([metin], "query");
  const sehirKucuk = sehir.trim().toLocaleLowerCase("tr-TR");
  // Konu düğmesi seçildiyse o konunun sözcüğü geçmeyen kayıt gösterilmez. Yalnızca serbest metin varsa en iyiye yakın olanlar kalır.
  const anahtar = anahtarlar(konular);
  const bagilKapi = anahtar.length === 0 && !filtre.tumu; // tumu: CV akışı, aday ilanları süzme değil puanlayıp sırala

  const sonDogrulamalar = async (tur: string) => {
    const satirlar = await db
      .select({ id: dogrulama.varlikId, t: dogrulama.kontrolTarihi, yontem: dogrulama.yontem, url: kaynak.url })
      .from(dogrulama).innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId))
      .where(eq(dogrulama.varlikTuru, tur)).orderBy(asc(dogrulama.kontrolTarihi));
    return new Map(satirlar.map((k) => [k.id, { tarih: new Date(k.t), yontem: k.yontem, url: k.url }])); // sonraki (yeni) satır eskisini ezer
  };
  const dFirsat = await sonDogrulamalar("firsat");
  const dGrup = await sonDogrulamalar("grup");
  const sonKontrol = new Map([...dFirsat].map(([id, d]) => [id, d.tarih]));

  const f = await db
    .select({ f: firsat, kurumAdi: kurum.ad, mesafe: cosineDistance(firsat.embedding, v) })
    .from(firsat).innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(isNotNull(firsat.embedding)))
    .orderBy(asc(cosineDistance(firsat.embedding, v))).limit(200);
  const enIyiIlan = f.length ? 1 - Number(f[0].mesafe) : 0;

  const ilanlar = f
    .map((r) => ({ ...r, durum: etkinDurum(r.f.durum, sonKontrol.get(r.f.id) ?? null, r.f.sonBasvuru ? new Date(r.f.sonBasvuru) : null) }))
    .filter((r) => r.durum !== "kapali")
    .filter((r) => !filtre.tur || r.f.tur === filtre.tur)
    .filter((r) => !filtre.sadeceAcik || r.durum === "acik")
    .filter((r) => !filtre.demoGizle || !r.f.baslik.startsWith("DEMO"))
    .filter((r) => anahtarGecer(`${r.f.baslik} ${r.f.aciklama ?? ""}`, anahtar))
    .filter((r) => !bagilKapi || bagilGecer(1 - Number(r.mesafe), enIyiIlan, 0.05))
    .filter((r) => !sehirKucuk || r.f.uzaktan || (r.f.sehir ?? "").toLocaleLowerCase("tr-TR").includes(sehirKucuk))
    .map((r) => ({ id: r.f.id, baslik: r.f.baslik, tur: r.f.tur, sonBasvuru: r.f.sonBasvuru, kalan: kalanGun(r.f.sonBasvuru), kurum: r.kurumAdi, sehir: r.f.sehir, uzaktan: r.f.uzaktan, durum: r.durum, aciklama: r.f.aciklama, benzerlik: 1 - Number(r.mesafe), dogrulama: dFirsat.get(r.f.id) ?? null }));

  const g = await db
    .select({ g: arastirmaGrubu, kurumAdi: kurum.ad, kurumSehir: kurum.sehir, mesafe: cosineDistance(arastirmaGrubu.embedding, v) })
    .from(arastirmaGrubu).innerJoin(kurum, eq(kurum.id, arastirmaGrubu.kurumId))
    .where(isNotNull(arastirmaGrubu.embedding))
    .orderBy(asc(cosineDistance(arastirmaGrubu.embedding, v))).limit(100);
  const enIyiGrup = g.length ? 1 - Number(g[0].mesafe) : 0;
  const gruplar = g
    .filter((r) => !filtre.demoGizle || !r.g.ad.startsWith("DEMO"))
    .filter((r) => anahtarGecer(`${r.g.ad} ${(r.g.konular ?? []).join(" ")}`, anahtar))
    .filter((r) => !bagilKapi || bagilGecer(1 - Number(r.mesafe), enIyiGrup, 0.05))
    .filter((r) => !sehirKucuk || (r.kurumSehir ?? "").toLocaleLowerCase("tr-TR").includes(sehirKucuk))
    .map((r) => ({ id: r.g.id, ad: r.g.ad, kurum: r.kurumAdi, kurumSehir: r.kurumSehir, konular: r.g.konular ?? [], kabul: r.g.kabul, sayfaUrl: r.g.sayfaUrl, dogrulama: dGrup.get(r.g.id) ?? null }));

  const hocalar = await hocaBul(metin, { hocaSayisi: 60, anahtar, bagilKapi, sehir });
  return { ilanlar, gruplar, hocalar, sehir: sehir.trim() };
}

export function kacGunOnce(d: Date, simdi = new Date()) {
  return Math.max(0, Math.floor((simdi.getTime() - d.getTime()) / 86_400_000));
}

/** Açılış sayfası: konu seçilmeden gösterilen, kaynağı gerçek ve güncel programlar. Son tarihi en yakın olan başta; kapanmış ve DEMO olanlar çıkmaz. */
export async function oneCikanlar(adet = 6) {
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(firsat).innerJoin(kurum, eq(kurum.id, firsat.kurumId));
  const kayit = await db
    .select({ id: dogrulama.varlikId, t: dogrulama.kontrolTarihi, yontem: dogrulama.yontem, url: kaynak.url })
    .from(dogrulama).innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId))
    .where(eq(dogrulama.varlikTuru, "firsat")).orderBy(asc(dogrulama.kontrolTarihi));
  const d = new Map(kayit.map((k) => [k.id, { tarih: new Date(k.t), yontem: k.yontem, url: k.url }]));
  return satirlar
    .filter((r) => !r.f.baslik.startsWith("DEMO"))
    .map((r) => ({ r, durum: etkinDurum(r.f.durum, d.get(r.f.id)?.tarih ?? null, r.f.sonBasvuru ? new Date(r.f.sonBasvuru) : null), kalan: kalanGun(r.f.sonBasvuru) }))
    .filter((x) => x.durum !== "kapali" && (x.kalan === null || x.kalan >= 0))
    .sort((a, b) => (a.kalan ?? 9999) - (b.kalan ?? 9999))
    .slice(0, adet)
    .map(({ r, durum, kalan }) => ({
      id: r.f.id, baslik: r.f.baslik, tur: r.f.tur, sonBasvuru: r.f.sonBasvuru, kalan, kurum: r.kurumAdi, sehir: r.f.sehir, uzaktan: r.f.uzaktan,
      durum, aciklama: r.f.aciklama, benzerlik: 0, dogrulama: d.get(r.f.id) ?? null,
    }));
}
