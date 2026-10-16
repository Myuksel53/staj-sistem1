import Link from "next/link";
import { eq } from "drizzle-orm";
import { Badge, Ikon, ProgressBar, type RozetTonu } from "@/components/ui";
import { db } from "@/db";
import { basvuru, eslesme, firsat, kayitliFirsat, kurum } from "@/db/schema";
import { basvuruEkle } from "@/features/basvurular/actions";
import type { Etiket } from "@/server/lib/eligibility";
import { sartlariHazirla, uygunlukAnalizi } from "@/server/lib/sartlar";
import { yolHaritasi } from "@/server/lib/yolharitasi";
import { profilVerisi } from "./profil-verisi";

const DURUM: Record<Etiket, [string, RozetTonu, "dogrulandi" | "uyari"]> = {
  karsilaniyor: ["Tam karşılıyor", "dogrulama", "dogrulandi"],
  kanit_bekliyor: ["Kanıt eksik", "inceleme", "uyari"],
  dogrulanmali: ["Doğrulanmalı", "inceleme", "uyari"],
  eksik: ["Eksik", "mercan", "uyari"],
};

/** Aynı cümleden çıkan şartların ayırt edilmesi için kısa başlık: "Sınıf: en az 3. sınıf", "Beceri: python"… */
export function sartBasligi(normalizeKosul: string | null): string | null {
  if (!normalizeKosul) return null;
  const m = normalizeKosul.match(/^(sinif|ortalama)>=(.+)$/);
  if (m) return m[1] === "sinif" ? `Sınıf: en az ${m[2]}. sınıf` : `Not ortalaması: en az ${m[2]}`;
  const b = normalizeKosul.match(/^beceri:(.+)$/);
  return b ? `Beceri: ${b[1].trim()}` : null;
}

async function hedefler(uid: string) {
  const sec = { id: firsat.id, baslik: firsat.baslik, kurum: kurum.ad };
  const [a, b, c] = await Promise.all([
    db.select(sec).from(kayitliFirsat).innerJoin(firsat, eq(firsat.id, kayitliFirsat.firsatId)).innerJoin(kurum, eq(kurum.id, firsat.kurumId)).where(eq(kayitliFirsat.kullaniciId, uid)),
    db.select(sec).from(basvuru).innerJoin(firsat, eq(firsat.id, basvuru.firsatId)).innerJoin(kurum, eq(kurum.id, firsat.kurumId)).where(eq(basvuru.kullaniciId, uid)),
    db.select(sec).from(eslesme).innerJoin(firsat, eq(firsat.id, eslesme.firsatId)).innerJoin(kurum, eq(kurum.id, firsat.kurumId)).where(eq(eslesme.kullaniciId, uid)),
  ]);
  return [...new Map([...a, ...b, ...c].map((x) => [x.id, x])).values()];
}

/** Seçilen ilanın şartlarını profil ve kanıtlarla karşılaştırır. Kanıtsız beyan "karşılıyor" sayılmaz. */
export async function UygunlukAnalizcisi({ hedefId }: { hedefId?: string }) {
  const { uid } = await profilVerisi();
  const liste = await hedefler(uid);
  const secili = liste.find((x) => x.id === hedefId) ?? liste[0];

  let govde: React.ReactNode;
  if (!secili) {
    govde = (
      <p className="rounded-xl border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-ink-mute">
        Analiz için bir program seç: <Link href="/" className="font-semibold text-primary hover:underline">Keşfet</Link> sayfasında ☆ Kaydet’e bas ya da <a href="/firsatlar" className="font-semibold text-primary hover:underline">Fırsatlarım</a>’da eşleştirme yap.
      </p>
    );
  } else {
    await sartlariHazirla(secili.id);
    const satirlar = await uygunlukAnalizi(uid, secili.id);
    const say = (e: Etiket) => satirlar.filter((s) => s.etiket === e).length;
    const toplam = satirlar.length;
    const yuzde = toplam ? Math.round((say("karsilaniyor") / toplam) * 100) : null;
    const zorunlu = satirlar.filter((s) => s.tur === "zorunlu");
    const zorunluTamam = zorunlu.filter((s) => s.etiket === "karsilaniyor").length;
    const eksikBeceri = satirlar.filter((s) => s.etiket === "eksik" || s.etiket === "kanit_bekliyor");
    const harita = (await yolHaritasi(satirlar)).filter((h) => h.kaynaklar.length > 0)[0];
    const kanitBekleyen = satirlar.find((s) => s.etiket === "kanit_bekliyor");
    govde = (
      <>
        {toplam === 0 ? (
          <p className="rounded-xl bg-paper p-5 text-sm text-ink-mute">Bu ilandan otomatik şart çıkarılamadı. Şartları ilanı kendin okuyarak kontrol et; sistem emin olmadığı şeyi uydurmaz.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-paper p-4 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Toplam uyumluluk</div>
                <div className="text-3xl font-extrabold text-primary">%{yuzde}</div>
                <div className="mt-1"><ProgressBar deger={yuzde ?? 0} ton="yesil" etiket="Toplam uyumluluk" /></div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Zorunlu şartlar</div>
                <div className="text-lg font-bold text-ink">{zorunlu.length ? `${zorunluTamam} / ${zorunlu.length} karşılandı` : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Kanıt eksik</div>
                <div className={`text-lg font-bold ${say("kanit_bekliyor") ? "text-inceleme-ink" : "text-ink"}`}>{say("kanit_bekliyor")} şart</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Eksik şart</div>
                <div className={`text-lg font-bold ${say("eksik") ? "text-mercan-ink" : "text-ink"}`}>{say("eksik")} şart</div>
              </div>
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">İlan şartları &amp; öğrenci profili eşleme matrisi</h3>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {satirlar.map((s) => {
                const [metin, ton, ikon] = DURUM[s.etiket];
                return (
                  <li key={s.id} className="flex flex-wrap items-start justify-between gap-2 p-3.5">
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold text-ink">{sartBasligi(s.normalizeKosul) ?? s.alinti}</p>
                      {sartBasligi(s.normalizeKosul) && <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">“{s.alinti}”</p>}
                      <p className="mt-0.5 text-xs text-ink-mute">Öğrenci profili: {s.profilMetni}</p>
                    </div>
                    <Badge ton={ton} ikon={ikon}>{metin}</Badge>
                  </li>
                );
              })}
            </ul>

            {(kanitBekleyen || harita || eksikBeceri.length > 0) && (
              <div className="mt-5 flex gap-3 rounded-xl border border-primary-line bg-primary-tint p-4">
                <Ikon ad="ampul" boyut={22} className="mt-0.5 text-primary" />
                <div className="text-sm text-ink-soft">
                  <p className="font-bold text-ink">Eksikleri kapatma ve uygunluğunu artırma önerisi</p>
                  {kanitBekleyen && <p className="mt-1">Becerin listelenmiş ama kanıtı yok. Kütüphaneye <strong>proje, sertifika ya da ders</strong> ekle; kanıtlanınca şart “karşılıyor” olur.</p>}
                  {harita && (
                    <p className="mt-1"><strong>{harita.beceri}</strong> için başlangıç kaynakları: {harita.kaynaklar.slice(0, 2).map((k, n) => <span key={k.url}>{n > 0 && ", "}<a href={k.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{k.baslik} ↗</a></span>)}</p>
                  )}
                  {!kanitBekleyen && !harita && <p className="mt-1">Eksik şartları ilanın kaynak sayfasından tekrar oku; bazıları belge ya da dönem koşulu olabilir.</p>}
                </div>
              </div>
            )}
          </>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-mute">Her şart ilan metnindeki bir cümleye dayanır. Bu otomatik bir okumadır; ilanı kaynak sayfadan da doğrula.</p>
          <div className="flex flex-wrap gap-2">
            <a href={`/firsat/${secili.id}`} className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft hover:border-primary-line hover:text-primary">İlanı aç</a>
            <form action={basvuruEkle}>
              <input type="hidden" name="firsatId" value={secili.id} />
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary">Başvuru takibine ekle</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <section id="analiz" className="kart scroll-mt-28 p-6" aria-label="Uygunluk analizcisi">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink"><Ikon ad="ara" boyut={20} className="text-primary" /> Otomatik uygunluk analizcisi</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-mute">Seçtiğin ilanın şartlarını doğrulanmış profilinle yan yana koyar.</p>
        </div>
        {liste.length > 0 && (
          <form method="get" action="/profil" className="flex items-center gap-2 rounded-lg bg-primary-tint p-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-mute" htmlFor="hedef">Hedef ilan</label>
            <select id="hedef" name="hedef" defaultValue={secili?.id} className="max-w-[16rem] rounded-lg border border-primary-line bg-surface px-2 py-1.5 text-sm text-ink">
              {liste.map((x) => <option key={x.id} value={x.id}>{x.baslik.replace(/^DEMO:\s*/, "")}</option>)}
            </select>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-secondary">Analiz et</button>
          </form>
        )}
      </div>
      <div className="mt-5">{govde}</div>
    </section>
  );
}

