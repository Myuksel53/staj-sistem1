import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dogrulama, firsat, kaynak, kayitliFirsat, kurum } from "@/db/schema";
import { etkinDurum } from "./freshness";
import { kalanGun } from "./tarih";

/** Son tarihi en yakın olan önce; tarihi olmayanlar sonda. Geçmiş tarihliler en sonda ("kaçırıldı"). */
export function programSirala<T extends { kalan: number | null }>(liste: T[]): T[] {
  const sira = (k: number | null) => (k === null ? 2 : k < 0 ? 3 : 0);
  return [...liste].sort((a, b) => sira(a.kalan) - sira(b.kalan) || (a.kalan ?? 0) - (b.kalan ?? 0));
}

/** Kullanıcının kaydettiği program kimlikleri. Oturum yoksa boş küme. */
export async function kayitliKume(uid: string | null): Promise<Set<string>> {
  if (!uid) return new Set();
  const s = await db.select({ id: kayitliFirsat.firsatId }).from(kayitliFirsat).where(eq(kayitliFirsat.kullaniciId, uid));
  return new Set(s.map((x) => x.id));
}

/** Kayıtlıysa kaldırır, değilse kaydeder. Var olmayan programda null döner. */
export async function kaydetDegistir(uid: string, firsatId: string): Promise<"kaydedildi" | "kaldirildi" | null> {
  const [var_] = await db.select({ id: kayitliFirsat.id }).from(kayitliFirsat)
    .where(and(eq(kayitliFirsat.kullaniciId, uid), eq(kayitliFirsat.firsatId, firsatId)));
  if (var_) {
    await db.delete(kayitliFirsat).where(eq(kayitliFirsat.id, var_.id));
    return "kaldirildi";
  }
  const [f] = await db.select({ id: firsat.id }).from(firsat).where(eq(firsat.id, firsatId));
  if (!f) return null;
  await db.insert(kayitliFirsat).values({ kullaniciId: uid, firsatId }).onConflictDoNothing();
  return "kaydedildi";
}

/** Kaydedilenler sayfası için kart verisi (ana sayfadaki ilan kartıyla aynı biçim). */
export async function kayitliProgramlar(uid: string) {
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(kayitliFirsat)
    .innerJoin(firsat, eq(firsat.id, kayitliFirsat.firsatId))
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(eq(kayitliFirsat.kullaniciId, uid));
  const kayit = await db
    .select({ id: dogrulama.varlikId, t: dogrulama.kontrolTarihi, yontem: dogrulama.yontem, url: kaynak.url })
    .from(dogrulama).innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId))
    .where(eq(dogrulama.varlikTuru, "firsat"));
  const d = new Map(kayit.map((k) => [k.id, { tarih: new Date(k.t), yontem: k.yontem, url: k.url }]));
  return programSirala(satirlar.map(({ f, kurumAdi }) => ({
    id: f.id, baslik: f.baslik, tur: f.tur, sonBasvuru: f.sonBasvuru, kalan: kalanGun(f.sonBasvuru), kurum: kurumAdi, sehir: f.sehir, uzaktan: f.uzaktan,
    durum: etkinDurum(f.durum, d.get(f.id)?.tarih ?? null, f.sonBasvuru ? new Date(f.sonBasvuru) : null),
    aciklama: f.aciklama, benzerlik: 0, dogrulama: d.get(f.id) ?? null,
  })));
}
