import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { Badge, Ikon } from "@/components/ui";
import { db } from "@/db";
import { akademisyen, basvuru, basvuruDurumu, firsat } from "@/db/schema";
import { aciliyet, kalanGun, kalanMetni } from "@/server/lib/tarih";
import { kullaniciId } from "@/server/middleware/rbac";
import { akademisyenTaslakOlustur, durumGuncelle, taslakKaydet, taslakOlustur } from "./actions";
import { TakvimAbonelik } from "./TakvimAbonelik";

type Durum = (typeof basvuruDurumu.enumValues)[number];

/** Pano sütunları (tasarım sistemi): her sütun bir veya birkaç durumu toplar. */
const SUTUNLAR: { ad: string; durumlar: Durum[]; yuzey: string; baslik: string }[] = [
  { ad: "Başvurulacak", durumlar: ["basvurulacak"], yuzey: "bg-sand", baslik: "text-ink-soft" },
  { ad: "Başvuruldu", durumlar: ["basvuruldu"], yuzey: "bg-primary-tint", baslik: "text-primary-ink" },
  { ad: "Yanıt bekleniyor", durumlar: ["yanit_bekleniyor"], yuzey: "bg-inceleme-tint", baslik: "text-inceleme-ink" },
  { ad: "Görüşme / sonuç", durumlar: ["gorusme", "sonuclandi"], yuzey: "bg-dogrulama-tint", baslik: "text-dogrulama-ink" },
];
const DURUM_AD: Record<Durum, string> = { basvurulacak: "Başvurulacak", basvuruldu: "Başvuruldu", yanit_bekleniyor: "Yanıt bekleniyor", gorusme: "Görüşme", sonuclandi: "Sonuçlandı" };

async function Pano() {
  const satirlar = await db
    .select({ b: basvuru, baslik: firsat.baslik, sonBasvuru: firsat.sonBasvuru, hoca: akademisyen.ad })
    .from(basvuru)
    .leftJoin(firsat, eq(firsat.id, basvuru.firsatId))
    .leftJoin(akademisyen, eq(akademisyen.id, basvuru.akademisyenId))
    .where(eq(basvuru.kullaniciId, await kullaniciId()))
    .orderBy(desc(basvuru.olusturma));

  if (satirlar.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="font-semibold text-ink">Henüz takip ettiğin bir başvuru yok</p>
        <p className="mt-1 text-sm text-ink-mute">Bir programda “Başvuru takibine ekle”ye bas; burada aşama aşama izle.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {SUTUNLAR.map((s) => {
        const kartlar = satirlar.filter((r) => s.durumlar.includes(r.b.durum));
        return (
          <section key={s.ad} aria-label={s.ad} className={`rounded-2xl p-3 ${s.yuzey}`}>
            <h2 className={`mb-3 flex items-center justify-between px-1 text-sm font-bold ${s.baslik}`}>{s.ad}<span className="rounded-full bg-surface px-2 py-0.5 text-xs">{kartlar.length}</span></h2>
            <ul className="flex flex-col gap-3">
              {kartlar.map(({ b, baslik, sonBasvuru, hoca }) => {
                const k = kalanGun(sonBasvuru);
                const acil = k !== null && k >= 0 && k <= 3;
                return (
                  <li key={b.id} className="kart flex flex-col gap-3 p-4">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Badge ton={b.akademisyenId ? "akademik" : "kurumsal"} ikon={b.akademisyenId ? "bina" : "canta"}>{b.akademisyenId ? "Akademisyen" : "Program"}</Badge>
                      </div>
                      <p className="text-sm font-semibold leading-snug text-ink">{baslik?.replace(/^DEMO:\s*/, "") ?? hoca}</p>
                      {k !== null && k >= 0 && (
                        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${acil ? "font-bold text-mercan-ink" : aciliyet(k) === "acil" || aciliyet(k) === "yakin" ? "font-medium text-ink-soft" : "text-ink-mute"}`}>
                          <Ikon ad={acil ? "uyari" : "takvim"} boyut={13} /> Son başvuru {kalanMetni(k)}
                        </p>
                      )}
                    </div>
                    <form action={durumGuncelle} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <select name="durum" defaultValue={b.durum} aria-label="Başvuru durumu" className="min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-xs text-ink">
                        {basvuruDurumu.enumValues.map((d) => <option key={d} value={d}>{DURUM_AD[d]}</option>)}
                      </select>
                      <button className="rounded-lg border border-primary-line bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary hover:bg-sky-50">Kaydet</button>
                    </form>
                    {b.epostaTaslagi ? (
                      <form action={taslakKaydet} className="flex flex-col gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute" htmlFor={`t-${b.id}`}>E-posta taslağı</label>
                        <textarea id={`t-${b.id}`} name="taslak" rows={6} defaultValue={b.epostaTaslagi} className="w-full rounded-lg border border-line-strong bg-surface p-2 text-xs text-ink" />
                        <button className="self-start rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-primary-line">Taslağı kaydet (sistem e-posta göndermez)</button>
                      </form>
                    ) : (
                      <form action={b.akademisyenId ? akademisyenTaslakOlustur : taslakOlustur}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="rounded-lg border border-primary-line bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary hover:bg-sky-50">E-posta taslağı oluştur</button>
                      </form>
                    )}
                  </li>
                );
              })}
              {kartlar.length === 0 && <li className="rounded-xl border border-dashed border-line-strong px-3 py-6 text-center text-xs text-ink-mute">Bu aşamada başvuru yok</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function Basvurular() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Başvuru takip merkezi</h1>
      <p className="mb-6 mt-1 text-sm text-ink-mute">Başvurularını aşama aşama izle. Taslaklar yalnızca kanıtlı becerilerini kullanır ve sistem hiçbir e-postayı senin adına göndermez.</p>
      <Suspense fallback={null}><TakvimAbonelik /></Suspense>
      <Suspense fallback={<p className="text-ink-mute">Yükleniyor…</p>}><Pano /></Suspense>
    </main>
  );
}
