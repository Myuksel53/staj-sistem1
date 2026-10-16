import { Suspense } from "react";
import { SectionHeader, dugmeSinifi } from "@/components/ui";
import { IlanKarti, KesifSonuc } from "@/features/kesif/KesifSonuc";
import { KONULAR, TURLER, kesif, oneCikanlar, type KesifFiltre } from "@/server/lib/kesif";
import { kayitliKume } from "@/server/lib/kayitli";
import { kullaniciIdOpsiyonel } from "@/server/middleware/rbac";

type Param = Promise<Record<string, string | string[] | undefined>>;

/** Zemin sade; yalnızca çok hafif bir turkuaz ışık. */
function Arka() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}

const ADIMLAR = [
  ["1", "İlgi alanını seç", "Konu düğmelerinden seç, kendi cümlenle yaz ya da CV’ni yükle. Giriş gerekmez."],
  ["2", "Kaynaklı sonuçları gör", "Staj ve araştırma programları, laboratuvarlar ve akademisyenler; her biri kaynağı ve kontrol tarihiyle gelir."],
  ["3", "Başvuruya hazırlan", "Giriş yapınca şartlarla karşılaştır, e-posta taslağı hazırla, başvurunu takip et. Taslağı sen gönderirsin."],
] as const;

const GUVEN = ["Her bilgi bir kaynağa bağlı", "Kontrol tarihi görünür", "Sistem e-posta göndermez", "CV’n kaydedilmez"] as const;

/** Konu seçilmeden gösterilen açılış içeriği: güncel gerçek programlar, nasıl çalışır, güven ilkeleri. */
async function Acilis() {
  const [liste, kayitli] = await Promise.all([oneCikanlar(6), kullaniciIdOpsiyonel().then(kayitliKume)]);
  return (
    <div className="flex flex-col gap-14">
      <section>
        <SectionHeader ayrac="elmas" not="kaynağı resmî sayfa, son tarihe göre">Öne çıkan güncel programlar</SectionHeader>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{liste.map((i) => <IlanKarti key={i.id} i={i} kayitli={kayitli.has(i.id)} />)}</ul>
        <p className="mt-4 text-center text-sm"><a href="/takvim" className="text-ink-mute hover:text-ink hover:underline">Tüm başvuru takvimini gör →</a></p>
      </section>

      <section>
        <SectionHeader ayrac="daire">Nasıl çalışır</SectionHeader>
        <ol className="grid gap-4 md:grid-cols-3">
          {ADIMLAR.map(([n, baslik, metin]) => (
            <li key={n} className="rounded-xl border border-line bg-surface p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-sm font-semibold text-primary-ink">{n}</span>
              <h3 className="mt-3 font-semibold text-ink">{baslik}</h3>
              <p className="mt-1 text-sm text-ink-mute">{metin}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 rounded-xl border border-line bg-surface p-6 md:grid-cols-[1fr_auto] md:items-center">
        <ul className="grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
          {GUVEN.map((g) => <li key={g} className="flex items-center gap-2"><span className="text-emerald-700">✓</span>{g}</li>)}
        </ul>
        <div className="flex flex-wrap gap-3">
          <a href="/cv" className={dugmeSinifi("birincil")}>CV’ni yükle</a>
          <a href="/ilan-analiz" className={dugmeSinifi("ikincil")}>İlan analizi</a>
        </div>
      </section>
    </div>
  );
}

const alanSinif = "rounded-lg border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-faint focus:border-primary";

function AramaFormu({ konu = [], serbest = "", sehir = "", tur = "", acik = false, demoGizle = false }:
  { konu?: string[]; serbest?: string; sehir?: string; tur?: string; acik?: boolean; demoGizle?: boolean }) {
  return (
    <form className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm" action="/">
      <div className="flex flex-wrap justify-center gap-2">
        {KONULAR.map((k) => (
          <label key={k} className="cursor-pointer">
            <input type="checkbox" name="konu" value={k} defaultChecked={konu.includes(k)} className="peer sr-only" />
            <span className="inline-block rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink-soft transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
              {k}
            </span>
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <input name="serbest" defaultValue={serbest} placeholder="Ya da kendi cümlenle yaz (ör. dron ile görüntü işleme)" className={alanSinif} />
        <input name="sehir" defaultValue={sehir} placeholder="Şehir (boşsa tüm Türkiye)" className={alanSinif} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-ink-soft">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2">Tür
            <select name="tur" defaultValue={tur} className={`${alanSinif} !py-1.5`}>
              <option value="">Hepsi</option>
              {Object.entries(TURLER).map(([k, v]) => <option key={k} value={k} className="text-black">{v}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" name="acik" value="1" defaultChecked={acik} className="h-4 w-4 accent-teal-700" /> Yalnızca başvurusu açık olanlar</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="gercek" value="1" defaultChecked={demoGizle} className="h-4 w-4 accent-teal-700" /> Demo kayıtları gizle</label>
        </div>
        <button className={dugmeSinifi("birincil")}>Fırsatları göster</button>
      </div>
    </form>
  );
}

function oku(q: Record<string, string | string[] | undefined>) {
  const konu = ([] as string[]).concat(q.konu ?? []).filter((k) => KONULAR.includes(k));
  const tek = (v: string | string[] | undefined, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const tur = tek(q.tur, 20);
  const filtre: KesifFiltre = {
    tur: (tur in TURLER ? tur : "") as KesifFiltre["tur"],
    sadeceAcik: q.acik === "1",
    demoGizle: q.gercek === "1",
  };
  return { konu, serbest: tek(q.serbest, 300), sehir: tek(q.sehir, 60), filtre };
}

async function FormVeSonuc({ sp }: { sp: Param }) {
  const o = oku(await sp);
  return <AramaFormu konu={o.konu} serbest={o.serbest} sehir={o.sehir} tur={o.filtre.tur} acik={o.filtre.sadeceAcik} demoGizle={o.filtre.demoGizle} />;
}

async function Sonuc({ sp }: { sp: Param }) {
  const o = oku(await sp);
  const s = await kesif(o.konu, o.serbest, o.sehir, o.filtre);
  if (!s) return <Acilis />;

  const sayi = (v: string | string[] | undefined) => Math.max(1, Number.parseInt(typeof v === "string" ? v : "1", 10) || 1);
  const q = await sp;
  const sayfa = { ip: sayi(q.ip), gp: sayi(q.gp), hp: sayi(q.hp) };
  // Sayfa değiştirirken konu, filtre ve diğer bölümlerin sayfası korunur.
  const link = (k: "ip" | "gp" | "hp", n: number) => {
    const u = new URLSearchParams();
    for (const [ad, v] of Object.entries(q)) for (const x of ([] as string[]).concat(v ?? [])) if (!["ip", "gp", "hp"].includes(ad)) u.append(ad, x);
    for (const [ad, n2] of Object.entries(sayfa)) if (ad !== k && n2 > 1) u.set(ad, String(n2));
    if (n > 1) u.set(k, String(n));
    return `/?${u.toString()}#${{ ip: "ilanlar", gp: "laboratuvarlar", hp: "akademisyenler" }[k]}`;
  };
  const kayitli = await kayitliKume(await kullaniciIdOpsiyonel());
  return <KesifSonuc s={s} sayfa={sayfa} link={link} kayitli={kayitli} />;
}

export default function Home({ searchParams }: { searchParams: Param }) {
  return (
    <div className="relative flex-1 overflow-hidden text-ink">
      <Arka />
      <main className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
        <section className="text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-mute">Bilgisayar · Elektronik Mühendisliği</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Doğru staja <span className="text-primary">ilgi alanınla</span> ulaş
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-mute">
            İlgi alanına uygun staj ve araştırma programlarını, laboratuvarları ve akademisyenleri kaynağı ve kontrol tarihiyle birlikte gör.
          </p>
        </section>

        <Suspense fallback={<AramaFormu />}><FormVeSonuc sp={searchParams} /></Suspense>

        <Suspense fallback={<p className="text-center text-ink-mute">Yükleniyor…</p>}><Sonuc sp={searchParams} /></Suspense>
      </main>
    </div>
  );
}
