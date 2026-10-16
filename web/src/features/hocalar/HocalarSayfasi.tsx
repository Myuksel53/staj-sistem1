import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui";
import { db } from "@/db";
import { kullaniciProfili } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";
import { hocaBul } from "@/server/lib/hocabul";
import { anahtarlar, konularTespit } from "@/server/lib/konu";
import { HataBildir } from "@/features/hata-bildir/HataBildir";
import { akademisyenBasvuruEkle } from "@/features/basvurular/actions";
import { HocaKarti } from "@/features/kesif/KesifSonuc";

async function Sonuclar({ q }: { q: Promise<{ q?: string }> }) {
  const { q: yazilan } = await q;
  // Arama kutusu boşsa kullanıcının profildeki ilgi alanlarıyla eşleştir.
  const [pr] = yazilan ? [] : await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, await kullaniciId()));
  const konu = yazilan || pr?.ilgiAlanlari;
  if (!konu) return <p className="mt-6 text-ink-mute">Bir konu yaz ya da <a href="/profil" className="underline">profilinde ilgi alanlarını doldur</a>; sana uygun hocalar otomatik gelir.</p>;
  // Metinde geçen konu başlıkları (siber, yapay zekâ…) varsa yalnızca kendi ana konusu o alana giren hocalar gelir; yoksa en iyi sonuca yakın olanlar.
  const anahtar = anahtarlar(konularTespit(konu));
  const hocalar = await hocaBul(konu, { hocaSayisi: 24, anahtar, bagilKapi: anahtar.length === 0 });
  return (
    <>
      {!yazilan && <p className="mt-6 text-sm text-ink-mute">Profilindeki ilgi alanlarına göre: <em>{konu}</em></p>}
      <p className="mt-2 text-xs text-ink-mute">Kaynak: OpenAlex (açık akademik veri). Öğrenci kabul edip etmediği bilinmiyor; hocaya sormadan varsayma.</p>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {hocalar.map((h) => (
          <HocaKarti key={h.akademisyenId} h={h} eylemler={
            <div className="flex flex-wrap items-center gap-3">
              <form action={akademisyenBasvuruEkle}>
                <input type="hidden" name="akademisyenId" value={h.akademisyenId} />
                <Button varyant="ikincil" className="!px-4 !py-1.5 text-xs">Takibe ekle</Button>
              </form>
              <HataBildir varlikTuru="akademisyen" varlikId={h.akademisyenId} />
            </div>
          } />
        ))}
        {hocalar.length === 0 && <li className="text-ink-mute md:col-span-2">Bu konuda sonuç yok. Konuyu daha genel yazmayı dene.</li>}
      </ul>
    </>
  );
}

export default function Hocalar({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-ink">Araştırma konusundan hoca bul</h1>
      <p className="mb-5 text-sm text-ink-mute">Boş bırakırsan profilindeki ilgi alanlarına göre arar.</p>
      <form className="flex gap-2">
        <input name="q" minLength={5} placeholder="ör. gömülü sistemlerde enerji verimli yapay zeka" className="w-full rounded-lg border border-line bg-surface px-4 py-2.5" />
        <Button>Ara</Button>
      </form>
      <Suspense fallback={<p className="mt-6">Aranıyor…</p>}><Sonuclar q={searchParams} /></Suspense>
    </main>
  );
}
