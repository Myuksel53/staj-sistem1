"use client";
import { Button } from "@/components/ui";
import { useActionState } from "react";
import { ilanAnaliz, type IlanDurum } from "@/features/ilan-analiz/actions";

const alan = "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-faint focus:border-primary";

export function IlanFormu() {
  const [durum, eylem, bekliyor] = useActionState<IlanDurum, FormData>(ilanAnaliz, null);
  return (
    <>
      <form action={eylem} className="cam flex flex-col gap-4 rounded-3xl p-6">
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          İlan metni (açıklama ve aranan nitelikler)
          <textarea name="ilan" rows={9} required minLength={60} placeholder="İlanı bulduğun siteden kopyala ve buraya yapıştır" className={alan} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-ink-soft">Sınıfın (isteğe bağlı)
            <input name="sinif" type="number" min={1} max={6} className={alan} /></label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">Ortalaman, 4 üzerinden (isteğe bağlı)
            <input name="ortalama" inputMode="decimal" placeholder="ör. 2.85" className={alan} /></label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">Becerilerin (virgülle)
            <input name="beceriler" placeholder="python, c, git" className={alan} /></label>
        </div>
        <Button disabled={bekliyor} className="self-center">
          {bekliyor ? "İnceleniyor…" : "Şartları çıkar ve karşılaştır →"}
        </Button>
        {durum?.hata && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{durum.hata}</p>}
      </form>
      {durum?.sonuc && <div className="mt-8">{durum.sonuc}</div>}
    </>
  );
}
