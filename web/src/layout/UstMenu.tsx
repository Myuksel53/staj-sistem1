import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { cikisYap } from "@/features/auth/actions";
import { adminMi } from "@/server/middleware/rbac";
import { supabaseSunucu } from "@/server/lib/supabase/server";
import { NavLink } from "./NavLink";

const HERKESE: [string, string][] = [["/", "Keşfet"], ["/cv", "CV ile eşleş"], ["/ilan-analiz", "İlan analizi"], ["/takvim", "Takvim"], ["/kaynaklar", "Öğrenme kaynakları"], ["/rehber", "Rehber"]];
const UYE: [string, string][] = [["/profil", "Profil"], ["/firsatlar", "Fırsatlarım"], ["/laboratuvarlar", "Laboratuvarlar"], ["/hocalar", "Hoca bul"], ["/kaydedilenler", "Kaydedilenler"], ["/basvurular", "Başvurular"], ["/aramalar", "Aramalar"]];

async function eposta(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { data } = await (await supabaseSunucu()).auth.getUser();
  return data.user?.email ?? null;
}

async function Hesap() {
  await connection(); // isteğe özel: oturum çerezi okunur, derleme sırasında önceden üretilmez
  const e = await eposta();
  if (!e) return null;
  return (
    <div className="border-t border-line bg-surface">
      <nav aria-label="Hesabım" className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto whitespace-nowrap px-6 py-2">
        <span className="mr-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Hesabım</span>
        {UYE.map(([h, ad]) => <NavLink key={h} href={h}>{ad}</NavLink>)}
        {adminMi(e) && <NavLink href="/yonetim">Yönetim</NavLink>}
      </nav>
    </div>
  );
}

async function SagTaraf() {
  await connection();
  const e = await eposta();
  return e ? (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-line bg-primary-tint text-sm font-bold text-primary">{e[0].toLocaleUpperCase("tr-TR")}</span>
      <span className="hidden max-w-[11rem] truncate text-sm font-semibold text-ink lg:inline" title={e}>{e}</span>
      <form action={cikisYap}><button className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-line-strong hover:text-ink">Çıkış</button></form>
    </div>
  ) : (
    <Link href="/giris" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary">Giriş / Kayıt</Link>
  );
}

export function UstMenu() {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 shadow-[0_1px_8px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Çalışmanın Yolu ana sayfa">
          <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z" /><path d="m8.5 12 2.4 2.4 4.6-4.9" strokeLinecap="round" /></svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-primary">Çalışmanın Yolu</span>
            <span className="hidden text-[11px] font-medium text-ink-mute sm:block">Akademik &amp; Sanayi Doğrulama Portalı</span>
          </span>
        </Link>
        <nav aria-label="Ana menü" className="order-3 -mx-2 flex w-[calc(100%+1rem)] gap-1 overflow-x-auto whitespace-nowrap rounded-xl bg-sand p-1 md:order-2 md:mx-0 md:w-auto">
          {/* Aktif sayfa vurgusu adresi okur; derleme sırasında vurgusuz düz bağlantılar gösterilir. */}
          <Suspense fallback={HERKESE.map(([h, ad]) => <Link key={h} href={h} className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-ink-mute">{ad}</Link>)}>
            {HERKESE.map(([h, ad]) => <NavLink key={h} href={h}>{ad}</NavLink>)}
          </Suspense>
        </nav>
        <div className="order-2 md:order-3"><Suspense fallback={<span className="text-sm text-ink-mute">…</span>}><SagTaraf /></Suspense></div>
      </div>
      <Suspense fallback={null}><Hesap /></Suspense>
    </header>
  );
}
