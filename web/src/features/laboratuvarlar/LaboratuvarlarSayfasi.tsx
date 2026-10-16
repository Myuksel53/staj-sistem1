import { Suspense } from "react";
import { asc, cosineDistance, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { arastirmaGrubu, dogrulama, kullaniciProfili, kurum } from "@/db/schema";
import { HataBildir } from "@/features/hata-bildir/HataBildir";
import { kullaniciId } from "@/server/middleware/rbac";

const KABUL = {
  kabul_ediyor: "öğrenci kabul ediyor",
  bilinmiyor: "öğrenci kabulü bilinmiyor — hocaya sormadan varsayma",
  kabul_etmiyor: "öğrenci kabul etmiyor",
} as const;

async function Liste() {
  const [p] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, await kullaniciId()));
  const sirala = p?.ilgiEmbedding ? asc(cosineDistance(arastirmaGrubu.embedding, p.ilgiEmbedding)) : asc(arastirmaGrubu.ad);
  const gruplar = await db
    .select({ g: arastirmaGrubu, kurumAdi: kurum.ad, sonKontrol: sql<Date | null>`(select max(${dogrulama.kontrolTarihi}) from ${dogrulama} where ${dogrulama.varlikId} = ${arastirmaGrubu.id})` })
    .from(arastirmaGrubu)
    .innerJoin(kurum, eq(kurum.id, arastirmaGrubu.kurumId))
    .orderBy(sirala)
    .limit(30);

  return (
    <ul className="flex flex-col gap-4">
      {gruplar.map(({ g, kurumAdi, sonKontrol }) => (
        <li key={g.id} className="rounded border p-4">
          <strong>{g.ad}</strong> <span className="text-ink-mute">· {kurumAdi}</span>
          <p className="mt-1 text-sm">{(g.konular ?? []).join(", ")}</p>
          <p className="mt-1 text-sm text-ink-mute">
            {KABUL[g.kabul]} · son kontrol: {sonKontrol ? new Date(sonKontrol).toLocaleDateString("tr-TR") : "yok"}
          </p>
          {g.sayfaUrl && <a href={g.sayfaUrl} className="text-sm underline" rel="noopener noreferrer">Resmî sayfa</a>}
          <HataBildir varlikTuru="grup" varlikId={g.id} />
        </li>
      ))}
      {gruplar.length === 0 && <li className="text-ink-mute">Henüz laboratuvar verisi yok.</li>}
    </ul>
  );
}


export default function Laboratuvarlar() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold">Laboratuvarlar</h1>
      <p className="mb-6 text-sm text-ink-mute">İlan vermeyen gruplar. Her kayıt elle doğrulanmış kaynağa bağlıdır.</p>
      <Suspense fallback={<p>Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
