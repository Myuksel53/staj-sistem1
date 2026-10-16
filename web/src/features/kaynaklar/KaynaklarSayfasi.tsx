import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { kaynakKutuphanesi } from "@/db/schema";

const TUR = { kurs: "Kurs", dokuman: "Belge", mini_proje: "Mini proje" } as Record<string, string>;

async function Liste() {
  const satirlar = await db.select().from(kaynakKutuphanesi).orderBy(asc(kaynakKutuphanesi.beceri), asc(kaynakKutuphanesi.baslik));
  const gruplar = new Map<string, typeof satirlar>();
  for (const s of satirlar) gruplar.set(s.beceri, [...(gruplar.get(s.beceri) ?? []), s]);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...gruplar].map(([beceri, liste]) => (
        <section key={beceri} className="cam rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-semibold capitalize text-ink">{beceri}</h2>
          <ul className="space-y-2 text-sm">
            {liste.map((k) => (
              <li key={k.id}>
                <a href={k.url} target="_blank" rel="noopener noreferrer" className="text-primary-ink underline underline-offset-2">{k.baslik} ↗</a>
                <span className="ml-2 rounded-md bg-sand px-1.5 py-0.5 text-xs text-ink-soft">{TUR[k.tur] ?? k.tur}</span>
                <span className="block text-xs text-ink-mute">son erişim kontrolü: {k.sonKontrol ? new Date(k.sonKontrol).toLocaleDateString("tr-TR") : "yok"}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {gruplar.size === 0 && <p className="text-ink-mute">Henüz kaynak yok.</p>}
    </div>
  );
}

export default function Kaynaklar() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Ücretsiz öğrenme kaynakları</h1>
      <p className="mb-6 text-ink-mute">İlanlarda sık istenen becerileri kapatmak için. Her bağlantının açıldığı kontrol edilmiştir; içeriği ve güncelliği ilgili sitenin sorumluluğundadır.</p>
      <Suspense fallback={<p>Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
