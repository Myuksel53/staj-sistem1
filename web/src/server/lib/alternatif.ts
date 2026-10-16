import { and, asc, cosineDistance, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { firsat, kurum } from "@/db/schema";
import { etkinDurum } from "./freshness";
import { yakinIller } from "./yakin-iller";

const tr = (s: string) => s.toLocaleLowerCase("tr");

/** Pure: aynı şehir, yakın il veya uzaktan olan adaylar kalır. */
export function sehirUygun(aday: { sehir: string | null; uzaktan: boolean | null }, sehir: string | null) {
  if (!sehir || aday.uzaktan || !aday.sehir) return true;
  const izinli = [sehir, ...yakinIller(sehir)].map(tr);
  return izinli.includes(tr(aday.sehir));
}

/** Verilen fırsata anlamca yakın, açık/bilinmeyen durumdaki en fazla 3 alternatif. */
export async function alternatifBul(firsatId: string, kullaniciSehri: string | null) {
  const [kaynakF] = await db.select().from(firsat).where(eq(firsat.id, firsatId));
  if (!kaynakF?.embedding) return [];
  const adaylar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(firsat)
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(ne(firsat.id, firsatId), isNotNull(firsat.embedding)))
    .orderBy(asc(cosineDistance(firsat.embedding, kaynakF.embedding)))
    .limit(20);
  return adaylar
    .filter(({ f }) =>
      etkinDurum(f.durum, null, f.sonBasvuru ? new Date(f.sonBasvuru) : null) !== "kapali" && sehirUygun(f, kullaniciSehri))
    .slice(0, 3);
}
