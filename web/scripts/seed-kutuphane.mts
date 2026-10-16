// Kullanım: npm run seed:kutuphane -- ../data/kutuphane.json [--kontrol-atla]
// Yol haritası kaynaklarını yükler. Her URL'in erişilebilir olduğu denetlenir (çürük link yol haritasına girmesin).
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { kaynakKutuphanesi } from "../src/db/schema";
import { Kutuphane } from "./kutuphane-sema";

const [dosya, ...bayraklar] = process.argv.slice(2);
if (!dosya) throw new Error("Dosya yolu ver: npm run seed:kutuphane -- ../data/kutuphane.json");
const kontrolAtla = bayraklar.includes("--kontrol-atla");
const { kaynaklar } = Kutuphane.parse(JSON.parse(readFileSync(dosya, "utf8")));

async function erisilebilir(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(10000) });
    if (r.ok) return true;
    // Bazı siteler HEAD'i reddeder; GET ile bir kez dene
    return (await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) })).ok;
  } catch {
    return false;
  }
}

let eklenen = 0, guncellenen = 0, atlanan = 0;
for (const k of kaynaklar) {
  if (!kontrolAtla && !(await erisilebilir(k.url))) {
    console.warn(`ATLANDI (erişilemedi): ${k.url}`);
    atlanan++;
    continue;
  }
  const alanlar = { baslik: k.baslik, tur: k.tur, sureSaat: k.sureSaat ?? null, sonKontrol: new Date() };
  const [var_] = await db.select().from(kaynakKutuphanesi)
    .where(and(eq(kaynakKutuphanesi.beceri, k.beceri), eq(kaynakKutuphanesi.url, k.url)));
  if (var_) {
    await db.update(kaynakKutuphanesi).set(alanlar).where(eq(kaynakKutuphanesi.id, var_.id));
    guncellenen++;
  } else {
    await db.insert(kaynakKutuphanesi).values({ beceri: k.beceri, url: k.url, ...alanlar });
    eklenen++;
  }
}
console.log(`eklenen: ${eklenen}, güncellenen: ${guncellenen}, atlanan: ${atlanan}`);
process.exit(0);
