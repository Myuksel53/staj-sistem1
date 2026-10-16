import { Badge, Ikon, ProgressBar, PuanHalkasi, SectionHeader } from "@/components/ui";
import { KaydetDugmesi } from "@/features/kaydedilenler/KaydetDugmesi";
import { TURLER, kacGunOnce, type kesif } from "@/server/lib/kesif";
import { kalanMetni } from "@/server/lib/tarih";
import type { Uyum } from "@/server/lib/cv-uyum";

type Dog = { tarih: Date; yontem: "otomatik" | "elle"; url: string } | null;
type Sonuc = NonNullable<Awaited<ReturnType<typeof kesif>>>;
export type IlanKartiVeri = Sonuc["ilanlar"][number];

const kisaTarih = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
const alanAdi = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

/** Kaynak doğrulama satırı: tarih + kaynak bağlantısı. 30 günden eskiyse kehribar (eski kayıt), kayıt yoksa uyarı. */
function Dogrulama({ d }: { d: Dog }) {
  if (!d) return <Badge ton="inceleme" ikon="uyari">Kaynak kaydı yok</Badge>;
  const gun = kacGunOnce(d.tarih);
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
      {gun <= 30
        ? <Badge ton="dogrulama" ikon="dogrulandi">Doğrulandı: {kisaTarih(d.tarih)}</Badge>
        : <Badge ton="inceleme" ikon="uyari">Eski kayıt: {gun} gün önce</Badge>}
      <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-ink-mute hover:text-primary">
        {alanAdi(d.url)} <Ikon ad="dis" boyut={12} />
      </a>
    </div>
  );
}

/** Son başvuru. Mercan YALNIZCA son 3 gün (tasarım sistemi kuralı); diğer durumlarda sakin metin. */
export function SonTarih({ kalan, tarih }: { kalan: number | null; tarih: string | null }) {
  if (kalan === null || !tarih) return <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute"><Ikon ad="takvim" boyut={14} />Son tarih belirtilmemiş</span>;
  const acil = kalan >= 0 && kalan <= 3;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${acil ? "font-bold text-mercan-ink" : kalan < 0 ? "text-ink-faint" : "font-medium text-ink-soft"}`}>
      <Ikon ad={acil ? "uyari" : "takvim"} boyut={14} />
      Son başvuru {new Date(`${tarih}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} · {kalanMetni(kalan)}
    </span>
  );
}

export const SAYFA_BOYU = 6;
const KART = "kart relative flex flex-col overflow-hidden";

function UyumKutusu({ u }: { u: Uyum }) {
  const ton = u.puan >= 75 ? "yesil" : u.puan >= 60 ? "mavi" : "sari";
  return (
    <div className="rounded-lg bg-paper p-3">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-mute">CV uyumu</div>
      <ProgressBar deger={u.puan} ton={ton} etiket="Uyum puanı" />
      <div className="mt-2 flex flex-wrap gap-1">
        {u.eslesen.map((b) => <Badge key={b} ton="dogrulama" kose="kare">{b}</Badge>)}
        {u.eksik.map((b) => <Badge key={b} ton="mercan" kose="kare">eksik: {b}</Badge>)}
        {u.eslesen.length === 0 && u.eksik.length === 0 && <span className="text-xs text-ink-mute">İlanda adı geçen beceri yok.</span>}
      </div>
    </div>
  );
}

/** Fırsat kartı. Üstte (yalnızca son 3 günde) mercan aciliyet bandı; kategori rozeti kurumsal staj ↔ akademik ayrımını gösterir. */
export function IlanKarti({ i, uyum, kayitli = false, eylemler, puan }: { i: IlanKartiVeri; uyum?: Uyum; kayitli?: boolean; eylemler?: React.ReactNode; puan?: number }) {
  const demo = i.baslik.startsWith("DEMO");
  const baslik = i.baslik.replace(/^DEMO:\s*/, "");
  const akademik = i.tur !== "staj";
  const acil = i.kalan !== null && i.kalan >= 0 && i.kalan <= 3;
  const skor = puan ?? uyum?.puan;
  return (
    <li className={KART}>
      {acil && (
        <div className="flex items-center gap-1.5 border-b border-mercan-line bg-mercan-tint px-5 py-1.5 text-xs font-bold text-mercan-ink">
          <Ikon ad="uyari" boyut={14} /> {i.kalan === 0 ? "SON GÜN BUGÜN" : `SON ${i.kalan} GÜN`}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge ton={akademik ? "akademik" : "kurumsal"} ikon={akademik ? "bina" : "canta"}>{akademik ? TURLER[i.tur] : "Kurumsal staj"}</Badge>
            {demo && <Badge ton="inceleme" kose="kare">DEMO</Badge>}
          </div>
          {skor !== undefined && <PuanHalkasi puan={skor} />}
        </div>
        <div>
          <a href={`/firsat/${i.id}`} className="text-base font-semibold leading-snug tracking-tight text-ink hover:text-primary">{baslik}</a>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-mute">
            {i.kurum.replace(/^DEMO\s*/, "")}
            {(i.uzaktan || i.sehir) && <span className="inline-flex items-center gap-1"><span aria-hidden>·</span><Ikon ad="konum" boyut={13} />{i.uzaktan ? "Uzaktan" : i.sehir}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {i.durum === "acik"
            ? <Badge ton="dogrulama" ikon="dogrulandi">Başvuru açık</Badge>
            : <Badge ton="inceleme" ikon="uyari">Başvuru durumu: Bilinmiyor</Badge>}
        </div>
        <SonTarih kalan={i.kalan} tarih={i.sonBasvuru} />
        {uyum && <UyumKutusu u={uyum} />}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <Dogrulama d={i.dogrulama} />
          <KaydetDugmesi firsatId={i.id} kayitli={kayitli} />
        </div>
        {eylemler}
      </div>
    </li>
  );
}

const KABUL = {
  kabul_ediyor: ["Öğrenci kabul ediyor", "dogrulama", "dogrulandi"],
  bilinmiyor: ["Kabul durumu: Bilinmiyor", "inceleme", "uyari"],
  kabul_etmiyor: ["Öğrenci kabul etmiyor", "mercan", "uyari"],
} as const;

function GrupKarti({ g }: { g: Sonuc["gruplar"][number] }) {
  const demo = g.ad.startsWith("DEMO");
  const [kabulMetni, kabulTon, kabulIkon] = KABUL[g.kabul];
  return (
    <li className={KART}>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1.5">
          <Badge ton="akademik" ikon="siseLab">Akademik laboratuvar</Badge>
          {demo && <Badge ton="inceleme" kose="kare">DEMO</Badge>}
        </div>
        <div>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">{g.ad.replace(/^DEMO:\s*/, "")}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-mute">
            {g.kurum.replace(/^DEMO\s*/, "")}
            {g.kurumSehir && <span className="inline-flex items-center gap-1"><span aria-hidden>·</span><Ikon ad="konum" boyut={13} />{g.kurumSehir}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">{g.konular.slice(0, 4).map((k) => <Badge key={k} ton="kum" kose="kare">{k}</Badge>)}</div>
        <div><Badge ton={kabulTon} ikon={kabulIkon}>{kabulMetni}</Badge></div>
        <div className="mt-auto border-t border-line pt-3"><Dogrulama d={g.dogrulama} /></div>
      </div>
    </li>
  );
}

export function HocaKarti({ h, eylemler }: { h: Sonuc["hocalar"][number]; eylemler?: React.ReactNode }) {
  const yayin = h.yayinlar[0];
  const ara = `https://www.google.com/search?q=${encodeURIComponent(`${h.ad} ${h.kurumAdi} akademik personel`)}`;
  return (
    <li className={KART}>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div><Badge ton="akademik" ikon="bina">Akademisyen</Badge></div>
        <div>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">{h.unvan ? `${h.unvan} ` : ""}{h.ad}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-mute">
            {h.kurumAdi}
            {h.kurumSehir && <span className="inline-flex items-center gap-1"><span aria-hidden>·</span><Ikon ad="konum" boyut={13} />{h.kurumSehir}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">{h.konular.slice(0, 3).map((k) => <Badge key={k} ton="kum" kose="kare">{k}</Badge>)}</div>
        {yayin && (
          <p className="line-clamp-2 text-xs text-ink-mute">
            Son çalışma: {yayin.doi ? <a href={yayin.doi} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-primary hover:underline">{yayin.baslik}</a> : yayin.baslik}
            {yayin.yil ? ` (${yayin.yil})` : ""}
          </p>
        )}
        <div><Badge ton="inceleme" ikon="uyari">Kabul durumu: Bilinmiyor</Badge></div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="text-xs text-ink-mute">Kaynak: OpenAlex</span>
          <a href={ara} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-primary-line bg-primary-tint px-3 py-1 text-xs font-semibold text-primary hover:bg-sky-50">Resmî sayfasını ara <Ikon ad="dis" boyut={12} /></a>
        </div>
        {eylemler}
      </div>
    </li>
  );
}

type Anahtar = "ip" | "gp" | "hp";

/** Klasik sayfa numaraları: « Önceki 1 2 3 … 9 Sonraki ». Sayfa adresleri `link` ile üretilir; tüm süzgeçler korunur. */
function Sayfalama({ toplam, sayfa, link, etiket }: { toplam: number; sayfa: number; link: (n: number) => string; etiket: string }) {
  const sayfaSayisi = Math.ceil(toplam / SAYFA_BOYU);
  if (sayfaSayisi <= 1) return null;
  const numaralar = [...new Set([1, sayfa - 1, sayfa, sayfa + 1, sayfaSayisi])].filter((n) => n >= 1 && n <= sayfaSayisi).sort((a, b) => a - b);
  const oge = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition";
  const pasif = "border border-line bg-surface text-ink-soft hover:border-primary-line hover:text-primary";
  return (
    <nav aria-label={`${etiket} sayfaları`} className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {sayfa > 1 && <a href={link(sayfa - 1)} className={`${oge} ${pasif}`}>‹ Önceki</a>}
      {numaralar.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - numaralar[i - 1] > 1 && <span className="text-ink-mute">…</span>}
          <a href={link(n)} aria-current={n === sayfa ? "page" : undefined}
            className={`${oge} ${n === sayfa ? "bg-primary font-bold text-white" : pasif}`}>{n}</a>
        </span>
      ))}
      {sayfa < sayfaSayisi && <a href={link(sayfa + 1)} className={`${oge} ${pasif}`}>Sonraki ›</a>}
    </nav>
  );
}

export function KesifSonuc({ s, altNot, sayfa, link, uyumlar, kayitli }: {
  uyumlar?: Map<string, Uyum>; kayitli?: Set<string>;
  s: Sonuc; altNot?: React.ReactNode;
  sayfa?: Record<Anahtar, number>; link?: (k: Anahtar, n: number) => string;
}) {
  const no = (k: Anahtar) => Math.max(1, sayfa?.[k] ?? 1);
  const dilim = <T,>(liste: T[], k: Anahtar) => liste.slice((no(k) - 1) * SAYFA_BOYU, no(k) * SAYFA_BOYU);
  const pager = (k: Anahtar, toplam: number, etiket: string) =>
    link ? <Sayfalama toplam={toplam} sayfa={no(k)} link={(n) => link(k, n)} etiket={etiket} /> : toplam > SAYFA_BOYU ? <p className="mt-3 text-center text-xs text-ink-mute">İlk {SAYFA_BOYU} sonuç gösteriliyor.</p> : null;
  const izgara = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className="flex flex-col gap-14">
      <section id="ilanlar" className="scroll-mt-24">
        <SectionHeader ayrac="elmas" not={`${s.ilanlar.length} sonuç`}>Sana uygun fırsatlar</SectionHeader>
        <ul className={izgara}>
          {dilim(s.ilanlar, "ip").map((i) => <IlanKarti key={i.id} i={i} uyum={uyumlar?.get(i.id)} kayitli={kayitli?.has(i.id)} />)}
          {s.ilanlar.length === 0 && (
            <li className="col-span-full rounded-xl border border-line bg-surface p-5 text-sm text-ink-soft">
              {s.sehir
                ? <>“{s.sehir}” için bu seçime uyan ilan yok. Elimizdeki ilanlar resmî kaynaklı ulusal programlar ve birkaç büyük şirket; şehir bazlı yerel ilanlar henüz yok. Aşağıda {s.sehir}’deki üniversitelerin akademisyenleri ve laboratuvarları listelenir. Şehir alanını boş bırakırsan tüm Türkiye’deki ilanları görürsün.</>
                : "Bu seçime uyan ilan bulunamadı."}
            </li>
          )}
        </ul>
        {pager("ip", s.ilanlar.length, "Fırsat")}
      </section>

      <section id="laboratuvarlar" className="scroll-mt-24">
        <SectionHeader ayrac="daire" not={`${s.gruplar.length} sonuç`}>İlgili laboratuvarlar</SectionHeader>
        <ul className={izgara}>
          {dilim(s.gruplar, "gp").map((g) => <GrupKarti key={g.id} g={g} />)}
          {s.gruplar.length === 0 && <li className="col-span-full text-sm text-ink-mute">Bu seçime uyan laboratuvar bulunamadı.</li>}
        </ul>
        {pager("gp", s.gruplar.length, "Laboratuvar")}
      </section>

      <section id="akademisyenler" className="scroll-mt-24">
        <SectionHeader ayrac="ucgen" not={`${s.hocalar.length} sonuç`}>Bu alanda çalışan akademisyenler</SectionHeader>
        <p className="-mt-2 mb-4 text-xs text-ink-mute">Kaynak: OpenAlex (açık akademik veri). Öğrenci kabul edip etmediği bilinmiyor; hocaya sormadan varsayma.</p>
        <ul className={izgara}>
          {dilim(s.hocalar, "hp").map((h) => <HocaKarti key={h.akademisyenId} h={h} />)}
          {s.hocalar.length === 0 && <li className="col-span-full text-sm text-ink-mute">Bu alanda akademisyen verisi yok.</li>}
        </ul>
        {pager("hp", s.hocalar.length, "Akademisyen")}
      </section>

      {altNot ?? (
        <div className="rounded-xl border border-line bg-surface p-5 text-center text-sm text-ink-soft">
          Uygunluğunu kontrol etmek, e-posta taslağı hazırlamak ve başvurunu takip etmek için{" "}
          <a href="/giris" className="font-semibold text-ink underline underline-offset-4">giriş yap</a>.
        </div>
      )}
    </div>
  );
}
