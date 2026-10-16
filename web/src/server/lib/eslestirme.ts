import { and, cosineDistance, eq, isNotNull, asc } from "drizzle-orm";
import { db } from "@/db";
import { firsat, kurum, kullaniciProfili, eslesme, dogrulama } from "@/db/schema";
import { kesinFiltre } from "./filters";
import { embed } from "./ai/embed";
import { adaylariSirala } from "./ai/claude";
import { konuPuanDuzelt, konularTespit } from "./konu";

const ADAY_SAYISI = 40;

/** Hat: kesin filtre → vektör arama (ilk 40) → LLM sıralama → Eşleşme tablosuna yaz. */
export async function eslestir(kullaniciId: string) {
  const [p] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, kullaniciId));
  if (!p?.ilgiAlanlari) throw new Error("Önce profilde ilgi alanlarını doldur.");

  const [vektor] = await embed([p.ilgiAlanlari], "query");
  await db.update(kullaniciProfili).set({ ilgiEmbedding: vektor }).where(eq(kullaniciProfili.id, kullaniciId));

  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad, ulke: kurum.ulke, mesafe: cosineDistance(firsat.embedding, vektor) })
    .from(firsat)
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(isNotNull(firsat.embedding)))
    .orderBy(asc(cosineDistance(firsat.embedding, vektor)))
    .limit(ADAY_SAYISI * 3);

  // Son kontrol tarihi Doğrulama tablosundan; yoksa null → "bilinmiyor"
  const kontroller = await db.select({ id: dogrulama.varlikId, t: dogrulama.kontrolTarihi })
    .from(dogrulama).where(eq(dogrulama.varlikTuru, "firsat"));
  const sonKontrol = new Map<string, Date>();
  for (const k of kontroller) {
    const onceki = sonKontrol.get(k.id);
    if (!onceki || k.t > onceki) sonKontrol.set(k.id, k.t);
  }

  const adaylar = satirlar
    .filter(({ f, ulke }) =>
      kesinFiltre(
        { sehir: f.sehir, uzaktan: f.uzaktan, durum: f.durum, sonKontrol: sonKontrol.get(f.id) ?? null,
          sonBasvuru: f.sonBasvuru ? new Date(f.sonBasvuru) : null, ulke },
        { sehir: p.sehir, uzaktan: p.uzaktan, ulkeler: p.ulkeler },
      ))
    .slice(0, ADAY_SAYISI);

  const hamSirali = await adaylariSirala(
    `${p.bolum ?? ""} sınıf ${p.sinif ?? "?"}. İlgi: ${p.ilgiAlanlari}. Öğrenmek istediği: ${(p.ogrenmekIstenenler ?? []).join(", ")}`,
    adaylar.map(({ f, kurumAdi, mesafe }) => ({
      firsatId: f.id, baslik: f.baslik, kurum: kurumAdi, metin: f.aciklama ?? f.baslik, benzerlik: 1 - Number(mesafe),
    })),
  );

  // Konu uyumu: profil siber/yapay zekâ ise web ilanı geri, aynı konudaki ilan öne gelir. Genel programlara dokunulmaz.
  const kullaniciKonulari = konularTespit(p.ilgiAlanlari);
  const metinler = new Map(adaylar.map(({ f }) => [f.id, `${f.baslik} ${f.aciklama ?? ""}`]));
  const sirali = hamSirali
    .map((s) => ({ ...s, puan: konuPuanDuzelt(s.puan, kullaniciKonulari, konularTespit(metinler.get(s.firsatId) ?? "")) }))
    .sort((a, b) => b.puan - a.puan);

  if (sirali.length) {
    await db.insert(eslesme).values(sirali.map((s) => ({
      kullaniciId, firsatId: s.firsatId, puan: s.puan, gerekce: s.gerekceler,
    })));
  }
  return sirali;
}
