import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui";
import { basvuruEkle } from "@/features/basvurular/actions";
import { IlanKarti } from "@/features/kesif/KesifSonuc";
import { kayitliProgramlar } from "@/server/lib/kayitli";
import { kullaniciId } from "@/server/middleware/rbac";

async function Liste() {
  const liste = await kayitliProgramlar(await kullaniciId());
  if (liste.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-medium text-ink">Henüz kaydettiğin program yok</p>
        <p className="mt-1 text-sm text-ink-mute">Keşfet sayfasında beğendiğin programın kartındaki “☆ Kaydet”e bas, burada toplansın.</p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover">Programlara göz at</Link>
      </div>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-ink-mute">{liste.length} program · son tarihi en yakın olan başta</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((i) => (
          <IlanKarti key={i.id} i={i} kayitli eylemler={
            <form action={basvuruEkle}>
              <input type="hidden" name="firsatId" value={i.id} />
              <Button varyant="ikincil" className="!px-4 !py-1.5 text-xs">Başvuru takibine ekle</Button>
            </form>
          } />
        ))}
      </ul>
    </>
  );
}

export default function Kaydedilenler() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-ink">Kaydettiğim programlar</h1>
      <p className="mb-6 text-sm text-ink-mute">Sonra bakmak istediklerini burada topla. Başvurmaya karar verince takibe ekle.</p>
      <Suspense fallback={<p className="text-ink-mute">Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
