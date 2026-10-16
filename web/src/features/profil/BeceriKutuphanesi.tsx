import { Badge, Ikon } from "@/components/ui";
import { beceriEkle, beceriKanitKaydet, beceriSil } from "./actions";
import { profilVerisi } from "./profil-verisi";

const alan = "min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20";

/** Beceri ve kanıt kütüphanesi. Kanıtlı beceri zümrüt "Kanıtlı", yalnızca beyan olan beceri kehribar "Kanıt bekleniyor" gösterilir. */
export async function BeceriKutuphanesi() {
  const { bec } = await profilVerisi();
  return (
    <section className="kart p-6" aria-label="Beceri ve kanıt kütüphanesi">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink"><Ikon ad="kalkan" boyut={20} className="text-primary" /> Beceri &amp; kanıt kütüphanesi</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-mute">Yalnızca kanıtı olan beceriler uygunluk analizinde “karşılıyor” sayılır ve e-posta taslağına yazılır. Kanıt: proje, sertifika ya da ders.</p>
        </div>
        <a href="#yeni-kanit" className="inline-flex items-center gap-1.5 rounded-lg border border-primary-line bg-primary-tint px-4 py-2 text-sm font-semibold text-primary hover:bg-sky-50"><Ikon ad="artı" boyut={16} /> Yeni kanıt ekle</a>
      </div>

      <ul className="mt-5 space-y-3">
        {bec.map((b) => {
          const kanitli = !!(b.kanit ?? "").trim();
          return (
            <li key={b.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-sm font-extrabold text-primary">{b.ad[0]?.toLocaleUpperCase("tr-TR")}</span>
                  <span className="font-semibold text-ink">{b.ad}</span>
                </div>
                {kanitli
                  ? <Badge ton="dogrulama" ikon="dogrulandi">Kanıtlı (1 kanıt)</Badge>
                  : <Badge ton="inceleme" ikon="uyari">Kanıt bekleniyor (yalnızca beyan)</Badge>}
              </div>
              {kanitli ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft"><Ikon ad="zincir" boyut={15} className="mt-0.5 text-ink-mute" /><span><strong className="text-ink">Kanıt:</strong> {b.kanit}</span></p>
              ) : (
                <form action={beceriKanitKaydet} className="mt-3 rounded-lg border border-inceleme-line bg-inceleme-tint p-3">
                  <p className="flex items-start gap-2 text-sm text-inceleme-ink"><Ikon ad="bilgi" boyut={16} className="mt-0.5" />Henüz kanıt eklenmedi. Analizde bu beceri “kanıt bekliyor” görünür, puanlamada karşılıyor sayılmaz.</p>
                  <input type="hidden" name="id" value={b.id} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input name="kanit" required minLength={3} placeholder="Kanıt: proje adı, sertifika, ders…" aria-label={`${b.ad} için kanıt`} className={alan} />
                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary">Hemen kanıt ekle</button>
                  </div>
                </form>
              )}
              <form action={beceriSil} className="mt-2 text-right">
                <input type="hidden" name="id" value={b.id} />
                <button className="text-xs text-ink-faint hover:text-mercan-ink hover:underline">Becerileri listesinden kaldır</button>
              </form>
            </li>
          );
        })}
        {bec.length === 0 && (
          <li className="rounded-xl border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-ink-mute">
            Henüz beceri eklemedin. Aşağıdan ekleyebilir ya da <a href="/cv" className="font-semibold text-primary hover:underline">CV’nden çıkarabilirsin</a>.
          </li>
        )}
      </ul>

      <form id="yeni-kanit" action={beceriEkle} className="mt-5 scroll-mt-28 rounded-xl bg-paper p-4">
        <h3 className="text-sm font-bold text-ink">Yeni beceri ve kanıtı ekle</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input name="ad" required placeholder="Beceri (ör. Python)" aria-label="Beceri adı" className={`${alan} sm:max-w-[14rem]`} />
          <input name="kanit" placeholder="Kanıt: proje, sertifika, ders" aria-label="Kanıt" className={alan} />
          <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-secondary">Ekle</button>
        </div>
        <p className="mt-2 text-xs text-ink-mute">Kanıtı şimdi yazmazsan beceri “yalnızca beyan” olarak kaydedilir; sonra kanıt ekleyebilirsin.</p>
      </form>
    </section>
  );
}
