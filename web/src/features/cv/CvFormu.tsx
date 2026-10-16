"use client";
import { Button } from "@/components/ui";
import { useActionState } from "react";
import { cvAnaliz, type CvDurum } from "@/features/cv/actions";

const alan = "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-faint focus:border-primary";

export function CvFormu() {
  const [durum, eylem, bekliyor] = useActionState<CvDurum, FormData>(cvAnaliz, null);
  return (
    <>
      <form action={eylem} className="cam flex flex-col gap-4 rounded-3xl p-6">
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          CV’ni yükle (PDF veya .txt, en fazla 5 MB)
          <input type="file" name="cv" accept=".pdf,.txt,application/pdf,text/plain" className={`${alan} file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white`} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-ink-soft">
          ya da CV metnini yapıştır
          <textarea name="metin" rows={5} placeholder="Dosya yüklemek istemezsen metni buraya yapıştır" className={alan} />
        </label>
        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="onay" value="1" required className="mt-1 h-4 w-4 accent-teal-700" />
          <span>CV’min yalnızca bu eşleştirme için, bu cihazdaki sunucuda işlenmesini kabul ediyorum. Dosya ve metin kaydedilmez.</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" name="gercek" value="1" className="h-4 w-4 accent-teal-700" /> Demo ilanları gizle (yalnızca gerçek kaynaklı programlar)</label>
        <Button disabled={bekliyor} className="self-center">
          {bekliyor ? "Analiz ediliyor…" : "CV’me uygun fırsatları bul →"}
        </Button>
        {durum?.hata && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{durum.hata}</p>}
      </form>
      {durum?.sonuc && <div className="mt-10">{durum.sonuc}</div>}
    </>
  );
}
