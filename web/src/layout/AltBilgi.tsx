import Link from "next/link";

export function AltBilgi() {
  return (
    <footer className="mt-16 border-t border-line bg-surface text-sm text-ink-mute">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-bold text-primary">
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z" /><path d="m8.5 12 2.4 2.4 4.6-4.9" strokeLinecap="round" /></svg>
            </span>
            Çalışmanın Yolu
          </p>
          <p className="mt-3">Doğrulanmış akademik ve kurumsal fırsat havuzu. Bilgisayar ve elektronik mühendisliği öğrencileri için; her bilgi kaynağı ve kontrol tarihiyle gelir.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">Keşfet</p>
          <ul className="space-y-1">
            <li><Link className="hover:text-primary" href="/cv">CV ile eşleş</Link></li>
            <li><Link className="hover:text-primary" href="/ilan-analiz">İlan analizi</Link></li>
            <li><Link className="hover:text-primary" href="/takvim">Başvuru takvimi</Link></li>
            <li><Link className="hover:text-primary" href="/kaynaklar">Öğrenme kaynakları</Link></li>
            <li><Link className="hover:text-primary" href="/rehber">Başvuru rehberi</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">Güven</p>
          <ul className="space-y-1">
            <li><Link className="hover:text-primary" href="/hakkinda">Doğrulama metodolojisi</Link></li>
            <li><Link className="hover:text-primary" href="/gizlilik">Gizlilik ve veriler</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line px-6 py-4 text-center text-xs">
        Bu sitedeki bilgiler resmî kaynak sayfalardan alınmıştır ve değişebilir; başvurmadan önce kaynağı kontrol et. Sistem senin adına hiçbir zaman e-posta göndermez.
      </p>
    </footer>
  );
}
