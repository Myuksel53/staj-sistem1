import { eq } from "drizzle-orm";
import { db } from "@/db";
import { beceri, firsat, kullaniciProfili, sart } from "@/db/schema";
import { sartlariCikar } from "./ai/claude";
import { sartDegerlendir, type Etiket } from "./eligibility";

/** Şartlar ilan başına bir kez çıkarılır ve saklanır (maliyet kuralı). */
export async function sartlariHazirla(firsatId: string) {
  const mevcut = await db.select().from(sart).where(eq(sart.firsatId, firsatId));
  if (mevcut.length) return mevcut;
  const [f] = await db.select().from(firsat).where(eq(firsat.id, firsatId));
  if (!f?.aciklama) return [];
  const cikarilan = await sartlariCikar(f.aciklama);
  if (!cikarilan.length) return [];
  return db.insert(sart).values(cikarilan.map((s) => ({ ...s, firsatId }))).returning();
}

export async function uygunlukAnalizi(kullaniciId: string, firsatId: string) {
  const [p] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, kullaniciId));
  const bec = await db.select().from(beceri).where(eq(beceri.kullaniciId, kullaniciId));
  const ad = (b: { ad: string }) => b.ad.trim().toLowerCase();
  const kanitli = bec.filter((b) => (b.kanit ?? "").trim());
  const ozet = {
    sinif: p?.sinif, ortalama: p?.ortalama,
    beceriler: kanitli.map(ad),
    beyanBeceriler: bec.filter((b) => !(b.kanit ?? "").trim()).map(ad),
    kanitlar: Object.fromEntries(kanitli.map((b) => [ad(b), b.kanit!.trim()])),
  };
  const sartlar = await db.select().from(sart).where(eq(sart.firsatId, firsatId));
  return sartlar.map((s) => { const d = sartDegerlendir(s.normalizeKosul, ozet); return { ...s, etiket: d.etiket as Etiket, profilMetni: d.profilMetni }; });
}
