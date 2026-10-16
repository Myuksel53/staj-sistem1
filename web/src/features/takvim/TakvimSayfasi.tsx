import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { firsat, kurum } from "@/db/schema";
import { aciliyet, kalanGun, kalanMetni } from "@/server/lib/tarih";

const RENK = { gecti: "bg-sand text-ink-mute", acil: "bg-rose-500/25 text-rose-700", yakin: "bg-amber-100 text-amber-800", rahat: "bg-primary-tint text-primary-ink" } as const;

async function Liste() {
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(firsat).innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .orderBy(asc(firsat.sonBasvuru));
  const gercek = satirlar.filter((r) => !r.f.baslik.startsWith("DEMO") && r.f.durum !== "kapali");
  const tarihli = gercek.filter((r) => r.f.sonBasvuru && (kalanGun(r.f.sonBasvuru) ?? -1) >= 0);
  const tarihsiz = gercek.filter((r) => !r.f.sonBasvuru);
  return (
    <>
      <ul className="flex flex-col gap-3">
        {tarihli.map(({ f, kurumAdi }) => {
          const k = kalanGun(f.sonBasvuru)!;
          return (
            <li key={f.id} className="cam flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div className="min-w-0">
                <a href={`/firsat/${f.id}`} className="block font-bold text-ink hover:underline">{f.baslik}</a>
                <span className="text-sm text-primary-ink">{kurumAdi}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${RENK[aciliyet(k)]}`}>
                  {new Date(`${f.sonBasvuru}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {kalanMetni(k)}
                </span>
                <a href={`/api/takvim?id=${f.id}`} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-primary">Takvime ekle</a>
              </div>
            </li>
          );
        })}
        {tarihli.length === 0 && <li className="text-ink-mute">Şu an tarihi belli, açık bir program yok.</li>}
      </ul>
      {tarihsiz.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-xl font-semibold text-ink">Tarihi henüz netleşmemiş programlar</h2>
          <p className="mb-3 text-sm text-ink-mute">Resmî sayfada dönem duyurulmamış ya da tarih yazmıyor. Başvuru zamanını sayfadan takip et.</p>
          <ul className="flex flex-col gap-3">
            {tarihsiz.map(({ f, kurumAdi }) => (
              <li key={f.id} className="cam rounded-2xl p-4">
                <a href={`/firsat/${f.id}`} className="font-bold text-ink hover:underline">{f.baslik}</a> <span className="text-sm text-primary-ink">· {kurumAdi}</span>
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{f.aciklama}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default function Takvim() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Başvuru takvimi</h1>
      <p className="mb-6 text-ink-mute">Gerçek, kaynağı bağlı programların son başvuru tarihleri. DEMO kayıtlar burada gösterilmez. Tarihleri başvurmadan önce resmî sayfadan yeniden kontrol et.</p>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
        <span className="text-ink-soft">Tüm tarihler takvimine düşsün, 7 gün ve 1 gün önce hatırlat:</span>
        <a href="/api/takvim/tum" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover">Takvim dosyasını indir (.ics)</a>
      </div>
      <Suspense fallback={<p>Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
