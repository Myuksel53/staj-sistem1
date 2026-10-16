import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { KaydetDugmesi } from "@/features/kaydedilenler/KaydetDugmesi";
import { kayitliKume } from "@/server/lib/kayitli";
import { kullaniciIdOpsiyonel } from "@/server/middleware/rbac";
import { db } from "@/db";
import { dogrulama, firsat, kaynak, kurum, sart } from "@/db/schema";
import { SonTarih } from "@/features/kesif/KesifSonuc";
import { etkinDurum } from "@/server/lib/freshness";
import { TURLER, kacGunOnce } from "@/server/lib/kesif";
import { kalanGun } from "@/server/lib/tarih";

const ALAN_ADI: Record<string, string> = { durum: "Başvuru durumu", sonBasvuru: "Son başvuru tarihi" };
const DURUM = { acik: ["Başvuru açık", "bg-emerald-100 text-emerald-700"], kapali: ["Kapalı", "bg-sand text-ink-mute"], bilinmiyor: ["Durum doğrulanmadı", "bg-amber-100 text-amber-800"] } as const;

async function Detay({ params }: { params: Promise<{ id: string }> }) {
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const [r] = await db.select({ f: firsat, k: kurum }).from(firsat).innerJoin(kurum, eq(kurum.id, firsat.kurumId)).where(eq(firsat.id, id.data));
  if (!r) notFound();
  const { f, k } = r;
  const kayitlar = await db
    .select({ alan: dogrulama.alan, deger: dogrulama.deger, tarih: dogrulama.kontrolTarihi, yontem: dogrulama.yontem, url: kaynak.url, celiski: dogrulama.celiskiBayragi })
    .from(dogrulama).innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId))
    .where(eq(dogrulama.varlikId, f.id)).orderBy(asc(dogrulama.kontrolTarihi));
  const sartlar = await db.select().from(sart).where(eq(sart.firsatId, f.id));
  const sonKontrol = kayitlar.length ? new Date(Math.max(...kayitlar.map((x) => +new Date(x.tarih)))) : null;
  const durum = etkinDurum(f.durum, sonKontrol, f.sonBasvuru ? new Date(f.sonBasvuru) : null);
  const [durumAd, durumRenk] = DURUM[durum];
  const kaynakUrl = kayitlar.at(-1)?.url;
  const demo = f.baslik.startsWith("DEMO");
  const kayitli = (await kayitliKume(await kullaniciIdOpsiyonel())).has(f.id);

  return (
    <article className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <Link href="/" className="text-sm text-primary-ink underline underline-offset-2">← Keşfet</Link>
      {demo && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Bu kayıt DEMO’dur; kurum ve ilan uydurmadır.</p>}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-bold text-ink">{f.baslik}</h1>
        <KaydetDugmesi firsatId={f.id} kayitli={kayitli} />
      </div>
      <p className="mt-1 text-primary-ink">{k.ad}{k.sehir ? ` · ${k.sehir}` : ""}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-primary-tint px-2.5 py-1 text-primary-ink">{TURLER[f.tur]}</span>
        <span className={`rounded-full px-2.5 py-1 ${durumRenk}`}>{durumAd}</span>
        <span className="rounded-full bg-primary-tint px-2.5 py-1 text-primary-ink">{f.uzaktan ? "uzaktan" : f.sehir ?? "şehir belirtilmemiş"}</span>
        {f.sureHafta && <span className="rounded-full bg-sand px-2.5 py-1 text-ink-soft">{f.sureHafta} hafta</span>}
        <SonTarih kalan={kalanGun(f.sonBasvuru)} tarih={f.sonBasvuru} />
      </div>

      <section className="cam mt-6 rounded-2xl p-5">
        <h2 className="mb-2 text-lg font-semibold text-ink">Açıklama</h2>
        <p className="whitespace-pre-line text-ink-soft">{f.aciklama}</p>
      </section>

      <section className="cam mt-4 rounded-2xl p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">Şartlar</h2>
        {sartlar.length === 0 ? <p className="text-sm text-ink-mute">Bu ilandan şart çıkarılamadı. Açıklamayı ve kaynak sayfayı oku.</p> : (
          <ul className="space-y-3">
            {sartlar.map((s) => (
              <li key={s.id} className="text-sm">
                <span className={`mr-2 rounded-md px-1.5 py-0.5 text-xs ${s.tur === "zorunlu" ? "bg-rose-100 text-rose-700" : "bg-primary-tint text-primary-ink"}`}>{s.tur === "zorunlu" ? "zorunlu" : "tercih"}</span>
                {s.normalizeKosul ? <span className="text-ink">{s.normalizeKosul.replace(">=", " ≥ ").replace("beceri:", "beceri: ")}</span> : <span className="text-amber-800">elle kontrol et</span>}
                <q className="mt-1 block text-ink-mute">{s.alinti}</q>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-mute">Her şart, ilan metnindeki bir cümleye dayanır. Bu otomatik bir okumadır; kaynakla karşılaştır.</p>
      </section>

      <section className="cam mt-4 rounded-2xl p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">Kaynak ve doğrulama geçmişi</h2>
        {kayitlar.length === 0 ? <p className="text-sm text-amber-800">⚠ Bu kayıt için doğrulama kaydı yok.</p> : (
          <ul className="space-y-2 text-sm">
            {kayitlar.map((x, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-ink">{ALAN_ADI[x.alan] ?? x.alan}: {x.deger ?? "—"}</span>
                <span className="text-ink-mute">{kacGunOnce(new Date(x.tarih))} gün önce · {x.yontem === "elle" ? "elle" : "otomatik"}</span>
                {x.celiski && <span className="text-rose-700">⚠ kaynaklar çelişiyor</span>}
              </li>
            ))}
          </ul>
        )}
        {kaynakUrl && <a href={kaynakUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-primary hover:bg-primary-hover px-5 py-2 text-sm font-medium text-white">Resmî sayfayı aç ↗</a>}
        {f.sonBasvuru && <a href={`/api/takvim?id=${f.id}`} className="ml-3 inline-block rounded-full border border-line px-5 py-2 text-sm text-ink-soft">Takvime ekle</a>}
      </section>

      <p className="cam mt-4 rounded-2xl p-4 text-center text-sm text-ink-soft">
        Bu şartları kendi profilinle karşılaştırmak ve e-posta taslağı hazırlamak için <Link href="/giris" className="font-semibold text-ink underline decoration-coral underline-offset-4">giriş yap</Link>.
      </p>
    </article>
  );
}

export default function FirsatSayfasi({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="px-6 py-10 text-ink-mute">Yükleniyor…</p>}><Detay params={params} /></Suspense>;
}
