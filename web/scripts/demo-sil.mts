// Kullanım: npm run demo:sil — "DEMO " ile başlayan kurumları ve onlara bağlı her şeyi siler.
import { inArray, like } from "drizzle-orm";
import { db } from "../src/db";
import { arastirmaGrubu, basvuru, dogrulama, eslesme, firsat, kaynak, kontrolKuyrugu, kurum, sart } from "../src/db/schema";

const kurumlar = (await db.select({ id: kurum.id }).from(kurum).where(like(kurum.ad, "DEMO %"))).map((k) => k.id);
if (kurumlar.length) {
  const firsatlar = (await db.select({ id: firsat.id }).from(firsat).where(inArray(firsat.kurumId, kurumlar))).map((f) => f.id);
  const gruplar = (await db.select({ id: arastirmaGrubu.id }).from(arastirmaGrubu).where(inArray(arastirmaGrubu.kurumId, kurumlar))).map((g) => g.id);
  const varliklar = [...firsatlar, ...gruplar];
  if (varliklar.length) {
    await db.delete(kontrolKuyrugu).where(inArray(kontrolKuyrugu.varlikId, varliklar));
    await db.delete(dogrulama).where(inArray(dogrulama.varlikId, varliklar));
  }
  if (firsatlar.length) {
    await db.delete(eslesme).where(inArray(eslesme.firsatId, firsatlar));
    await db.delete(basvuru).where(inArray(basvuru.firsatId, firsatlar));
    await db.delete(sart).where(inArray(sart.firsatId, firsatlar));
    await db.delete(firsat).where(inArray(firsat.id, firsatlar));
  }
  if (gruplar.length) await db.delete(arastirmaGrubu).where(inArray(arastirmaGrubu.id, gruplar));
  await db.delete(kurum).where(inArray(kurum.id, kurumlar));
}
await db.delete(kaynak).where(like(kaynak.url, "https://example.com/demo/%"));
console.log(`silindi: ${kurumlar.length} demo kurum ve bağlı kayıtlar`);
process.exit(0);
