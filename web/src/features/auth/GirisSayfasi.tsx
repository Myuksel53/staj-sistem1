import { Suspense } from "react";
import { Button } from "@/components/ui";
import { girisYap } from "./actions";

const alan = "mt-1.5 w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-faint focus:border-primary";

async function Hata({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  return hata ? <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{hata}</p> : null;
}

const FAYDALAR = ["Profilinle eşleşen fırsatlar ve uygunluk analizi", "Kanıta dayalı e-posta taslağı (gönderimi sen yaparsın)", "Başvuru takibi ve kayıtlı aramalar"];

export default function Giris({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 items-center gap-10 px-6 py-14 md:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Hesabını aç, başvurunu takip et</h1>
        <p className="mt-3 text-ink-mute">Giriş yapmadan da fırsatları gezebilirsin. Hesapla birlikte şunları kazanırsın:</p>
        <ul className="mt-5 space-y-3 text-sm text-ink-soft">
          {FAYDALAR.map((f) => <li key={f} className="flex gap-2"><span className="text-emerald-700">✓</span>{f}</li>)}
        </ul>
        <p className="mt-6 text-xs text-ink-mute">Verilerini istediğin zaman <a href="/gizlilik" className="underline">silebilirsin</a>.</p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <Suspense><Hata searchParams={searchParams} /></Suspense>
        <form action={girisYap} className="flex flex-col gap-4">
          <label className="text-sm text-ink-soft">E-posta
            <input name="email" type="email" required autoComplete="email" placeholder="ad@gmail.com" className={alan} /></label>
          <label className="text-sm text-ink-soft">Şifre
            <input name="sifre" type="password" minLength={8} required autoComplete="current-password" placeholder="En az 8 karakter" className={alan} /></label>
          <Button name="mod" value="kayit" className="mt-2 w-full">Yeni hesap aç</Button>
          <Button name="mod" value="giris" varyant="ikincil" className="w-full">Zaten hesabım var, giriş yap</Button>
        </form>
      </section>
    </main>
  );
}
