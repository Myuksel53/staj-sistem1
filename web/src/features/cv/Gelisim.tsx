import { Badge, Ikon } from "@/components/ui";
import type { EksikBeceri, Gozlem } from "@/server/lib/cv-oneri";

/** CV sonrası gelişim önerileri: (1) ilanlarda istenip CV'de olmayan beceriler + kaynaklar, (2) alandaki laboratuvar konuları, (3) CV gözlemleri. */
export function GelisimOnerileri({ alanlar, eksikler, konular, gozlemler, ilanSayisi, demoDahil }: {
  alanlar: string[]; eksikler: EksikBeceri[]; konular: { konu: string; sayi: number }[]; gozlemler: Gozlem[]; ilanSayisi: number; demoDahil: boolean;
}) {
  return (
    <section aria-label="Gelişim önerileri" className="kart p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink"><Ikon ad="ampul" boyut={20} className="text-primary" /> Alanında gelişmek için öneriler</h2>
      <p className="mt-1 text-sm text-ink-mute">
        {alanlar.length > 0 ? <>CV’nden anlaşılan alanlar: {alanlar.map((a) => <Badge key={a} ton="kurumsal">{a}</Badge>).reduce<React.ReactNode[]>((t, e, i) => (i ? [...t, " ", e] : [e]), [])}. </> : null}
        Öneriler, elimizdeki {ilanSayisi} güncel ilan ve laboratuvar verisine dayanır; piyasanın tamamını temsil etmez.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-mute">İlanlarda istenen, CV’nde olmayan beceriler</h3>
          {eksikler.length === 0 ? <p className="text-sm text-ink-mute">Bu ilanlarda, CV’nde eksik görünen bir beceri bulunamadı.</p> : (
            <ul className="space-y-2.5">
              {eksikler.map((e) => (
                <li key={e.beceri} className="rounded-xl border border-line bg-paper p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{e.beceri}</span>
                    <Badge ton="mercan" kose="kare">{e.ilanSayisi} ilanda geçiyor</Badge>
                  </div>
                  {e.kaynaklar.length > 0 ? (
                    <ul className="mt-1.5 space-y-0.5 text-xs">
                      {e.kaynaklar.slice(0, 2).map((k) => <li key={k.url}><a href={k.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{k.baslik} ↗</a></li>)}
                    </ul>
                  ) : <p className="mt-1.5 text-xs text-ink-faint">Kütüphanemizde bu beceri için kaynak yok.</p>}
                </li>
              ))}
            </ul>
          )}
          {demoDahil && eksikler.length > 0 && <p className="mt-2 text-[11px] text-ink-faint">Sayılara DEMO ilanlar da dahil; yalnızca gerçek kayıtlar için “Demo ilanları gizle”yi işaretle.</p>}
        </div>

        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-mute">Alanındaki laboratuvarların çalıştığı konular</h3>
          {konular.length === 0 ? <p className="text-sm text-ink-mute">Eşleşen laboratuvar bulunamadı.</p> : (
            <div className="flex flex-wrap gap-1.5">
              {konular.map((k) => <Badge key={k.konu} ton="akademik">{k.konu}{k.sayi > 1 ? ` · ${k.sayi}` : ""}</Badge>)}
            </div>
          )}
          <p className="mt-2 text-xs text-ink-mute">Bu konulardan birinde küçük bir proje yapıp CV’ne eklemek, o laboratuvara yazarken somut bir dayanak olur.</p>
        </div>

        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-mute">CV gözlemleri</h3>
          <ul className="space-y-2 text-sm">
            {gozlemler.map((g) => (
              <li key={g.metin} className="flex items-start gap-2">
                <Ikon ad={g.iyi ? "dogrulandi" : "bilgi"} boyut={16} className={`mt-0.5 ${g.iyi ? "text-dogrulama" : "text-inceleme"}`} />
                <span className={g.iyi ? "text-ink-soft" : "text-ink"}>{g.metin}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-ink-faint">Bunlar basit otomatik gözlemlerdir; CV’nin kalitesine dair bir puan değildir.</p>
        </div>
      </div>
    </section>
  );
}
