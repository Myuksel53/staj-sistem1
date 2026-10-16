import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { dogrulama, kaynak, kontrolKuyrugu } from "@/db/schema";
import { icerikHash } from "./icerik";
import { robotsIzinVerir } from "./robots";

const YENIDEN_GUN = 14; // 30 günlük bayatlama kuralının önünde kal
const PARTI = 50;
const UA = process.env.BOT_USER_AGENT ?? "CalismaninYoluBot/1.0";

export type Sonuc = "ayni" | "degisti" | "kayip" | "ilk" | "engelli" | "hata";

/** Pure: önceki hash ve yanıt durumundan sonucu çıkarır. */
export function sonucBelirle(durumKodu: number, oncekiHash: string | null, yeniHash: string | null): Sonuc {
  if (durumKodu === 404 || durumKodu === 410) return "kayip";
  if (durumKodu < 200 || durumKodu >= 300 || !yeniHash) return "hata";
  if (!oncekiHash) return "ilk";
  return oncekiHash === yeniHash ? "ayni" : "degisti";
}

async function robotsIzni(url: URL): Promise<boolean> {
  try {
    const r = await fetch(new URL("/robots.txt", url.origin), { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return true; // robots.txt yoksa kısıt yoktur
    return robotsIzinVerir(await r.text(), url.pathname + url.search, UA);
  } catch {
    return false; // emin olamıyorsak çekme
  }
}

async function kuyrugaEkle(varlikTuru: string, varlikId: string, neden: "icerik_degisti" | "kaynak_kayip", kaynakId: string) {
  const [var_] = await db.select({ id: kontrolKuyrugu.id }).from(kontrolKuyrugu).where(and(
    eq(kontrolKuyrugu.varlikTuru, varlikTuru), eq(kontrolKuyrugu.varlikId, varlikId),
    eq(kontrolKuyrugu.neden, neden), eq(kontrolKuyrugu.durum, "bekliyor")));
  if (!var_) await db.insert(kontrolKuyrugu).values({ varlikTuru, varlikId, neden, kaynakId });
}

/** Bu kaynağa bağlı her (varlık, alan) için en güncel değeri otomatik olarak yeniden onaylar. */
async function yenidenOnayla(kaynakId: string) {
  const satirlar = await db.select().from(dogrulama).where(eq(dogrulama.kaynakId, kaynakId)).orderBy(desc(dogrulama.kontrolTarihi));
  const gorulen = new Set<string>();
  for (const d of satirlar) {
    const anahtar = `${d.varlikTuru}:${d.varlikId}:${d.alan}`;
    if (gorulen.has(anahtar)) continue;
    gorulen.add(anahtar);
    await db.insert(dogrulama).values({
      varlikTuru: d.varlikTuru, varlikId: d.varlikId, alan: d.alan, deger: d.deger, alinti: d.alinti,
      kaynakId, yontem: "otomatik",
    });
  }
}

/**
 * Yalnızca resmî sayfalar taranır (ilan siteleri kullanım şartı gereği, OpenAlex API kayıtları anlamlı bir sayfa olmadığı için hariç).
 * robots.txt'e uyulur. Değişen/kaybolan kaynağa bağlı varlıklar kontrol kuyruğuna girer; değişmeyenler yeniden onaylanır.
 */
export async function yenidenDogrula(simdi = new Date()) {
  const esik = new Date(simdi.getTime() - YENIDEN_GUN * 86400000);
  const kaynaklar = await db.select().from(kaynak)
    .where(and(eq(kaynak.tur, "resmi_sayfa"), or(isNull(kaynak.sonGetirilme), lt(kaynak.sonGetirilme, esik))))
    .orderBy(kaynak.sonGetirilme).limit(PARTI);

  const ozet: Record<Sonuc, number> = { ayni: 0, degisti: 0, kayip: 0, ilk: 0, engelli: 0, hata: 0 };
  for (const k of kaynaklar) {
    const url = new URL(k.url);
    if (!(await robotsIzni(url))) { ozet.engelli++; continue; }

    let kod = 0, hash: string | null = null;
    try {
      const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
      kod = r.status;
      if (r.ok) hash = icerikHash(await r.text());
    } catch { /* kod 0 → hata */ }

    const sonuc = sonucBelirle(kod, k.icerikHash, hash);
    ozet[sonuc]++;
    if (sonuc === "hata") continue; // geçici sorun: sonGetirilme güncellenmez, sonraki turda yeniden denenir

    await db.update(kaynak).set({ sonGetirilme: simdi, ...(hash ? { icerikHash: hash } : {}) }).where(eq(kaynak.id, k.id));
    if (sonuc === "ayni") await yenidenOnayla(k.id);
    if (sonuc === "degisti" || sonuc === "kayip") {
      const bagli = await db.selectDistinct({ t: dogrulama.varlikTuru, id: dogrulama.varlikId })
        .from(dogrulama).where(eq(dogrulama.kaynakId, k.id));
      for (const b of bagli) await kuyrugaEkle(b.t, b.id, sonuc === "kayip" ? "kaynak_kayip" : "icerik_degisti", k.id);
    }
  }
  return { taranan: kaynaklar.length, ...ozet };
}

