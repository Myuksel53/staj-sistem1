import { Ikon } from "@/components/ui";
import { gorunenAd, profilVerisi } from "./profil-verisi";

const UZAKTAN = (u: boolean | null | undefined) => (u == null ? "Fark etmez" : u ? "Yalnızca uzaktan" : "Yalnızca yerinde");

function Tercih({ ikon, baslik, metin }: { ikon: "konum" | "canta" | "ampul" | "bina"; baslik: string; metin: string }) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-paper px-3 py-2.5">
      <Ikon ad={ikon} boyut={18} className="mt-0.5 text-primary" />
      <span className="min-w-0 text-sm">
        <span className="block font-semibold text-ink">{baslik}</span>
        <span className="line-clamp-2 text-xs text-ink-mute">{metin}</span>
      </span>
    </li>
  );
}

/** Sol sütun: profil kartı (turkuaz bant, baş harf avatarı, GANO ve kanıt durumu, kayıtlı tercihler). */
export async function ProfilKarti() {
  const { p, bec, kanitli, eposta } = await profilVerisi();
  const ad = gorunenAd(eposta);
  return (
    <section className="kart overflow-hidden" aria-label="Profil özeti">
      <div className="h-20 bg-gradient-to-r from-primary to-secondary" />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex justify-center">
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-primary-tint text-3xl font-extrabold text-primary shadow-sm" aria-hidden>
            {ad[0]}
            {kanitli.length > 0 && <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-dogrulama text-white"><Ikon ad="dogrulandi" boyut={14} /></span>}
          </span>
        </div>
        <h2 className="mt-3 text-center text-xl font-bold tracking-tight text-ink">{ad}</h2>
        <p className="text-center text-sm font-semibold text-primary">{p?.bolum ?? "Bölüm bilgisi yok"}</p>
        <p className="text-center text-xs text-ink-mute">{p?.sinif ? `${p.sinif}. sınıf lisans öğrencisi` : "Sınıf bilgisi yok"}</p>

        <div className="mt-4 grid grid-cols-2 divide-x divide-line rounded-xl bg-primary-tint py-3 text-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Güncel GANO</div>
            <div className="mt-0.5 text-lg font-bold text-primary">{p?.ortalama ?? "—"}<span className="text-xs font-medium text-ink-mute"> /4.00</span></div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Kanıt durumu</div>
            <div className="mt-0.5 text-lg font-bold text-dogrulama-ink">{bec.length ? `${kanitli.length}/${bec.length}` : "—"}<span className="text-xs font-medium text-ink-mute"> kanıtlı</span></div>
          </div>
        </div>

        <h3 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">Kayıtlı tercihler &amp; uygunluk</h3>
        <ul className="space-y-2">
          <Tercih ikon="konum" baslik="Lokasyon" metin={p?.sehir || "Belirtilmedi (tüm Türkiye)"} />
          <Tercih ikon="canta" baslik="Çalışma modeli" metin={UZAKTAN(p?.uzaktan)} />
          <Tercih ikon="ampul" baslik="İlgi alanları" metin={p?.ilgiAlanlari || "Henüz yazılmadı"} />
          <Tercih ikon="bina" baslik="Ülke tercihi" metin={p?.ulkeler?.length ? p.ulkeler.join(", ") : "Fark etmez"} />
        </ul>
        <a href="#duzenle" className="mt-4 block rounded-lg border border-primary-line bg-primary-tint py-2 text-center text-sm font-semibold text-primary hover:bg-sky-50">Profil bilgilerini düzenle</a>
      </div>
    </section>
  );
}

export function CvKarti() {
  return (
    <section className="kart p-5" aria-label="CV ile beceri çıkarma">
      <h2 className="flex items-center gap-2 font-bold text-ink"><Ikon ad="yukle" boyut={18} className="text-primary" /> CV ile beceri çıkar</h2>
      <p className="mt-1 text-xs text-ink-mute">CV’ni yükle; becerilerini çıkaralım ve sana uygun fırsatları gösterelim. Dosyan ve metni kaydedilmez.</p>
      <a href="/cv" className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary">CV’ni analiz et</a>
    </section>
  );
}

export function Manifesto() {
  return (
    <section className="rounded-2xl border border-primary-line bg-primary-tint p-5" aria-label="Doğrulama manifestosu">
      <h2 className="flex items-center gap-2 font-bold text-primary-ink"><Ikon ad="kalkan" boyut={18} /> Doğrulama manifestosu</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Kanıtı olmayan bir beceri, uygunluk analizinde “karşılıyor” sayılmaz ve e-posta taslaklarına yazılmaz. Kanıt olarak bir proje, sertifika ya da ders ekle; ekleyince beceri analizde puan kazanır. Sistem senin adına hiçbir zaman e-posta göndermez.
      </p>
    </section>
  );
}
