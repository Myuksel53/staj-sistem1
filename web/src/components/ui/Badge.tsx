import { Ikon, type IkonAdi } from "./Ikon";

/** Tasarım sistemi rozetleri. Anlam renge bağlıdır ama yalnızca renkle verilmez: ikon/metin de bulunur.
 *  dogrulama = doğrulanmış kaynak · inceleme = bilinmiyor/teyit bekliyor · mercan = aciliyet/eksik şart
 *  akademik = laboratuvar/akademisyen · kurumsal = şirket stajı · kum = nötr etiket */
const TONLAR = {
  dogrulama: "border-dogrulama-line bg-dogrulama-tint text-dogrulama-ink",
  inceleme: "border-inceleme-line bg-inceleme-tint text-inceleme-ink",
  mercan: "border-mercan-line bg-mercan-tint text-mercan-ink",
  akademik: "border-akademik-line bg-akademik-tint text-akademik",
  kurumsal: "border-primary-line bg-primary-tint text-primary",
  bilgi: "border-cyan-200 bg-cyan-50 text-secondary",
  kum: "border-line bg-sand text-ink-soft",
  // eski adlar (geriye uyumluluk)
  yesil: "border-dogrulama-line bg-dogrulama-tint text-dogrulama-ink",
  sari: "border-inceleme-line bg-inceleme-tint text-inceleme-ink",
  kirmizi: "border-mercan-line bg-mercan-tint text-mercan-ink",
  mavi: "border-cyan-200 bg-cyan-50 text-secondary",
  mor: "border-akademik-line bg-akademik-tint text-akademik",
  pembe: "border-primary-line bg-primary-tint text-primary",
  gri: "border-line bg-sand text-ink-mute",
  notr: "border-line bg-sand text-ink-soft",
} as const;

export type RozetTonu = keyof typeof TONLAR;

/** Hap biçimli (varsayılan) ya da küçük köşeli (`kose="kare"`) rozet. `ikon`: başa küçük simge. */
export function Badge({ ton = "notr", kose = "hap", ikon, children }: { ton?: RozetTonu; kose?: "hap" | "kare"; ikon?: IkonAdi; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 border text-xs font-medium ${kose === "hap" ? "rounded-full px-2.5 py-0.5" : "rounded-md px-2 py-0.5"} ${TONLAR[ton]}`}>
      {ikon && <Ikon ad={ikon} boyut={13} />}
      {children}
    </span>
  );
}
