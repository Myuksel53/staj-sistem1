// Kullanım: npm run seed -- ../data/cekirdek.json
// Elle doğrulanmış çekirdek veriyi yükler. Her kayıt kaynak + doğrulama (yöntem: elle) ile yazılır.
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { arastirmaGrubu, dogrulama, firsat, kaynak, kurum } from "../src/db/schema";
import { embed } from "../src/server/lib/ai/embed";
import { Cekirdek } from "./cekirdek-sema";

const dosya = process.argv[2];
if (!dosya) throw new Error("Dosya yolu ver: npm run seed -- ../data/cekirdek.json");
const { kayitlar, gruplar } = Cekirdek.parse(JSON.parse(readFileSync(dosya, "utf8")));

const vektorler = await embed(kayitlar.map((k) => `${k.baslik}\n${k.aciklama}`), "document");

for (const [i, k] of kayitlar.entries()) {
  let [kr] = await db.select().from(kurum).where(eq(kurum.ad, k.kurum.ad));
  kr ??= (await db.insert(kurum).values(k.kurum).returning())[0];

  const [kay] = await db.insert(kaynak)
    .values({ ...k.kaynak, sonGetirilme: new Date() })
    .onConflictDoUpdate({ target: kaynak.url, set: { sonGetirilme: new Date() } })
    .returning();

  const alanlar = {
    tur: k.tur, kurumId: kr.id, baslik: k.baslik, aciklama: k.aciklama, sehir: k.sehir ?? null,
    uzaktan: k.uzaktan ?? null, sureHafta: k.sureHafta ?? null, sonBasvuru: k.sonBasvuru ?? null,
    durum: k.durum, embedding: vektorler[i],
  };
  const [var_] = await db.select().from(firsat).where(and(eq(firsat.kurumId, kr.id), eq(firsat.baslik, k.baslik)));
  const f = var_
    ? (await db.update(firsat).set(alanlar).where(eq(firsat.id, var_.id)).returning())[0]
    : (await db.insert(firsat).values(alanlar).returning())[0];

  const dogrulananlar: [string, string | null][] = [["durum", k.durum], ["sonBasvuru", k.sonBasvuru ?? null]];
  await db.insert(dogrulama).values(dogrulananlar.map(([alan, deger]) => ({
    varlikTuru: "firsat", varlikId: f.id, alan, deger, kaynakId: kay.id, yontem: k.dogrulamaYontemi,
  })));
  console.log(`${var_ ? "güncellendi" : "eklendi"}: ${k.kurum.ad} / ${k.baslik}`);
}

const grupVektorleri = gruplar.length
  ? await embed(gruplar.map((g) => `${g.ad}: ${g.konular.join(", ")}`), "document") : [];
for (const [i, g] of gruplar.entries()) {
  let [kr] = await db.select().from(kurum).where(eq(kurum.ad, g.kurum.ad));
  kr ??= (await db.insert(kurum).values(g.kurum).returning())[0];
  const [kay] = await db.insert(kaynak)
    .values({ ...g.kaynak, sonGetirilme: new Date() })
    .onConflictDoUpdate({ target: kaynak.url, set: { sonGetirilme: new Date() } })
    .returning();
  const alanlar = { kurumId: kr.id, ad: g.ad, konular: g.konular, sayfaUrl: g.sayfaUrl, kabul: g.kabul, embedding: grupVektorleri[i] };
  const [mevcut] = await db.select().from(arastirmaGrubu).where(and(eq(arastirmaGrubu.kurumId, kr.id), eq(arastirmaGrubu.ad, g.ad)));
  const grup = mevcut
    ? (await db.update(arastirmaGrubu).set(alanlar).where(eq(arastirmaGrubu.id, mevcut.id)).returning())[0]
    : (await db.insert(arastirmaGrubu).values(alanlar).returning())[0];
  await db.insert(dogrulama).values([["konular", g.konular.join(", ")], ["kabul", g.kabul]].map(([alan, deger]) => ({
    varlikTuru: "grup", varlikId: grup.id, alan, deger, kaynakId: kay.id, yontem: g.dogrulamaYontemi,
  })));
  console.log(`${mevcut ? "güncellendi" : "eklendi"} grup: ${g.kurum.ad} / ${g.ad}`);
}
process.exit(0);
