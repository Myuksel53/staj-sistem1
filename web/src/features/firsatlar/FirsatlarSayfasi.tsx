import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { eslesme, firsat, kurum } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";
import { uygunlukAnalizi } from "@/server/lib/sartlar";
import { yolHaritasi } from "@/server/lib/yolharitasi";
import { alternatifBul } from "@/server/lib/alternatif";
import { kullaniciProfili } from "@/db/schema";
import { basvuruEkle } from "@/features/basvurular/actions";
import { HataBildir } from "@/features/hata-bildir/HataBildir";
import { eslestirAction, uygunlukKontrolAction } from "./actions";
import { ProfilDurumu } from "@/features/profil/ProfilDurumu";

type Gerekce = { metin: string; alinti: string };
const ETIKET = { karsilaniyor: "✓ karşılanıyor", eksik: "✗ eksik", dogrulanmali: "? doğrulanmalı", kanit_bekliyor: "! kanıt bekliyor (yalnızca beyan)" } as const;

async function Liste() {
  const uid = await kullaniciId();
  const satirlar = await db
    .select({ e: eslesme, f: firsat, kurumAdi: kurum.ad })
    .from(eslesme)
    .innerJoin(firsat, eq(firsat.id, eslesme.firsatId))
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(eq(eslesme.kullaniciId, uid))
    .orderBy(desc(eslesme.olusturma), desc(eslesme.puan))
    .limit(30);
  const analizler = await Promise.all(satirlar.map(({ f }) => uygunlukAnalizi(uid, f.id)));
  const [profil] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, uid));
  const yolHaritalari = await Promise.all(analizler.map((a) => yolHaritasi(a)));
  // Alternatif yalnızca sorunlu kartlar için: durumu belirsiz/kapalı ya da eksik şartı var
  const alternatifler = await Promise.all(satirlar.map(({ f }, i) =>
    f.durum !== "acik" || analizler[i].some((s) => s.etiket === "eksik")
      ? alternatifBul(f.id, profil?.sehir ?? null) : Promise.resolve([])));

  if (satirlar.length === 0) {
    return (
      <p className="rounded border p-4 text-sm text-ink-mute">
        Henüz eşleşme yok. “Eşleştir”e bas. Sonuç yine boş kalırsa şehir filtresi fazla dar olabilir:
        <a href="/profil" className="underline"> profilde şehri boş bırak ya da uzaktan çalışmayı “fark etmez” yap</a>.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {satirlar.map(({ e, f, kurumAdi }, i) => (
        <li key={e.id} className="rounded border p-4">
          <div className="flex justify-between">
            <strong>{f.baslik}</strong><span>{Math.round(e.puan)}/100</span>
          </div>
          <div className="text-sm text-ink-mute">
            {kurumAdi} · durum: {f.durum === "bilinmiyor" ? "bilinmiyor (doğrulanmalı)" : f.durum}
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {(e.gerekce as Gerekce[]).map((g, k) => (
              <li key={k}>{g.metin} <q className="text-ink-mute">{g.alinti}</q></li>
            ))}
          </ul>
          {analizler[i].length > 0 && (
            <ul className="mt-2 text-sm">
              {analizler[i].map((s) => (
                <li key={s.id}>{ETIKET[s.etiket]} — {s.metin} <q className="text-ink-mute">{s.alinti}</q></li>
              ))}
            </ul>
          )}
          {yolHaritalari[i].length > 0 && (
            <div className="mt-2 text-sm">
              <strong>Eksikleri kapatma yolu</strong>
              <ul className="list-disc pl-5">
                {yolHaritalari[i].map((y) => (
                  <li key={y.beceri}>{y.beceri}:{" "}
                    {y.kaynaklar.length
                      ? y.kaynaklar.map((k) => <a key={k.url} className="mr-2 underline" href={k.url} rel="noopener noreferrer">{k.baslik}{k.sureSaat ? ` (~${k.sureSaat} sa)` : ""}</a>)
                      : <em className="text-ink-mute">kütüphanede kaynak yok</em>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alternatifler[i].length > 0 && (
            <div className="mt-2 text-sm">
              <strong>Benzer alternatifler</strong>
              <ul className="list-disc pl-5">
                {alternatifler[i].map(({ f: a, kurumAdi: k }) => <li key={a.id}>{a.baslik} — {k}{a.sehir ? ` (${a.sehir})` : ""}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {analizler[i].length === 0 && (
              <form action={uygunlukKontrolAction}>
                <input type="hidden" name="firsatId" value={f.id} />
                <button className="rounded border px-3 py-1">Uygunluğu kontrol et</button>
              </form>
            )}
            <form action={basvuruEkle}>
              <input type="hidden" name="firsatId" value={f.id} />
              <button className="rounded border px-3 py-1">Takibe ekle</button>
            </form>
          </div>
          <HataBildir varlikTuru="firsat" varlikId={f.id} />
        </li>
      ))}
      {satirlar.length === 0 && <li className="text-ink-mute">Henüz eşleşme yok. Önce profilini doldur, sonra “Eşleştir”e bas.</li>}
    </ul>
  );
}


export default function Firsatlar() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Eşleşen fırsatlar</h1>
        <form action={eslestirAction}><button className="rounded border px-3 py-1">Eşleştir</button></form>
      </div>
      <Suspense fallback={null}><ProfilDurumu kompakt /></Suspense>
      <Suspense fallback={<p>Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
