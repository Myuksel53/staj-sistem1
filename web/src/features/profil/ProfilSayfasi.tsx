import { Suspense } from "react";
import { Badge, Ikon } from "@/components/ui";
import { profilKaydet, hesapSil } from "./actions";
import { BeceriKutuphanesi } from "./BeceriKutuphanesi";
import { CvKarti, Manifesto, ProfilKarti } from "./ProfilKarti";
import { ProfilDurumu } from "./ProfilDurumu";
import { profilVerisi } from "./profil-verisi";
import { UygunlukAnalizcisi } from "./UygunlukAnalizcisi";

const alan = "mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20";

type Param = Promise<{ kaydedildi?: string; hedef?: string }>;

/** Üst kart: sayfanın ilkesi ve kanıt oranı. Oran = kanıtlı beceri / tüm beceriler. */
async function Baslik() {
  const { bec, kanitli, beyan } = await profilVerisi();
  const oran = bec.length ? Math.round((kanitli.length / bec.length) * 100) : null;
  return (
    <header className="kart flex flex-wrap items-center justify-between gap-5 p-6">
      <div className="min-w-0 max-w-2xl">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary"><Ikon ad="kalkan" boyut={14} /> Akademik ve sanayi eşleştirme motoru</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-[28px]">Profilim, beceri kanıtları &amp; uygunluk analizcisi</h1>
        <p className="mt-1.5 text-sm text-ink-mute">Kanıtlanamayan hiçbir yetenek, yapay zekâ tarafından işverene veya laboratuvara “uygun” olarak iletilmez.</p>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-primary-line bg-primary-tint px-5 py-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Kanıt oranı</div>
          <div className="text-2xl font-extrabold text-primary">{oran === null ? "—" : `%${oran}`}</div>
        </div>
        <div className="flex flex-col gap-1">
          <Badge ton="dogrulama" ikon="dogrulandi">{kanitli.length} kanıt aktif</Badge>
          <Badge ton="inceleme" ikon="uyari">{beyan.length} beyan bekliyor</Badge>
        </div>
      </div>
    </header>
  );
}

async function ProfilFormu({ searchParams }: { searchParams: Param }) {
  const { p: pr } = await profilVerisi();
  const { kaydedildi } = await searchParams;
  return (
    <>
      {kaydedildi && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-dogrulama-line bg-dogrulama-tint p-3 text-sm text-dogrulama-ink">
          <Ikon ad="dogrulandi" boyut={16} /> Profilin kaydedildi. Şimdi <a href="/firsatlar" className="font-bold underline">Fırsatlarım</a> sayfasında “Eşleştir”e basabilirsin.
        </p>
      )}
      <form action={profilKaydet} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink-soft">Bölüm<input name="bolum" required className={alan} defaultValue={pr?.bolum ?? "Bilgisayar Mühendisliği"} /></label>
        <label className="text-sm font-medium text-ink-soft">Sınıf<input name="sinif" type="number" min={1} max={6} required className={alan} defaultValue={pr?.sinif ?? undefined} /></label>
        <label className="text-sm font-medium text-ink-soft">Ortalama (4 üzerinden, isteğe bağlı)<input name="ortalama" type="number" step="0.01" min={0} max={4} className={alan} defaultValue={pr?.ortalama ?? undefined} /></label>
        <label className="text-sm font-medium text-ink-soft">Şehir<input name="sehir" className={alan} defaultValue={pr?.sehir ?? ""} /></label>
        <label className="text-sm font-medium text-ink-soft sm:col-span-2">İlgi alanların (en az 10 karakter)<textarea name="ilgiAlanlari" required minLength={10} rows={3} className={alan} defaultValue={pr?.ilgiAlanlari ?? ""} /></label>
        <label className="text-sm font-medium text-ink-soft">Ülkeler (iki harfli kod, virgülle; boşsa fark etmez)<input name="ulkeler" placeholder="TR, DE" className={alan} defaultValue={(pr?.ulkeler ?? []).join(", ")} /></label>
        <label className="text-sm font-medium text-ink-soft">Uzaktan çalışma
          <select name="uzaktan" className={alan} defaultValue={pr?.uzaktan == null ? "farketmez" : pr.uzaktan ? "evet" : "hayir"}>
            <option value="farketmez">Fark etmez</option>
            <option value="evet">Yalnızca uzaktan</option>
            <option value="hayir">Yalnızca yerinde</option>
          </select>
        </label>
        <div className="sm:col-span-2"><button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary">Kaydet</button></div>
      </form>
    </>
  );
}

const ISKELET = <div className="h-40 animate-pulse rounded-2xl bg-sand" />;

export default function ProfilSayfasi({ searchParams }: { searchParams: Param }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Suspense fallback={ISKELET}><Baslik /></Suspense>
      <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <Suspense fallback={ISKELET}><ProfilKarti /></Suspense>
          <CvKarti />
          <Manifesto />
        </div>
        <div className="flex flex-col gap-6">
          <Suspense fallback={ISKELET}><BeceriKutuphanesi /></Suspense>
          <Suspense fallback={ISKELET}><AnalizSarmal searchParams={searchParams} /></Suspense>
        </div>
      </div>

      <section id="duzenle" className="kart mt-6 scroll-mt-28 p-6" aria-label="Profil bilgilerini düzenle">
        <h2 className="text-xl font-bold tracking-tight text-ink">Profil bilgilerim</h2>
        <p className="mb-4 mt-1 text-sm text-ink-mute">Eşleştirme ve uygunluk analizi bu bilgilere dayanır.</p>
        <Suspense fallback={ISKELET}><Tamamlama /><ProfilFormu searchParams={searchParams} /></Suspense>
      </section>

      <details className="mt-6 rounded-xl border border-mercan-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-mercan-ink">Hesabımı ve verilerimi sil</summary>
        <form action={hesapSil} className="mt-3 flex max-w-md flex-col gap-2 text-sm">
          <p className="text-ink-mute">Hesabın, profilin, becerilerin, kaydettiklerin, eşleşmelerin ve başvuruların kalıcı olarak silinir. Geri alınamaz.</p>
          <label className="font-medium text-ink-soft">Onaylamak için <strong>SIL</strong> yaz<input name="onay" required pattern="SIL" className={alan} autoComplete="off" /></label>
          <button className="self-start rounded-lg border border-mercan bg-surface px-4 py-2 font-semibold text-mercan-ink hover:bg-mercan-tint">Kalıcı olarak sil</button>
        </form>
      </details>
    </main>
  );
}

async function AnalizSarmal({ searchParams }: { searchParams: Param }) {
  const { hedef } = await searchParams;
  return <UygunlukAnalizcisi hedefId={hedef} />;
}

function Tamamlama() {
  return <div className="mb-5"><ProfilDurumu /></div>;
}
