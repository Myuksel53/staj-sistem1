/** Küçük satır içi ikon seti (çizgi stili, currentColor). Harici ikon yazı tipi yüklenmez. Dekoratiftir: anlam metinle verilir. */
const YOLLAR = {
  dogrulandi: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
  uyari: <><path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
  bilgi: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.1" /></>,
  kalkan: <><path d="M12 3 4.5 6v5.5c0 4.4 3 7.5 7.5 9.5 4.5-2 7.5-5.1 7.5-9.5V6L12 3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  bina: <><path d="M4 20V9l8-5 8 5v11" /><path d="M2.5 20h19M9 20v-6h6v6M8.5 10.5h.1M12 10.5h.1M15.5 10.5h.1" /></>,
  canta: <><rect x="3" y="7.5" width="18" height="12" rx="2" /><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 13h18" /></>,
  siseLab: <><path d="M9.5 3.5h5M10.5 3.5v6L5 18.8A1.7 1.7 0 0 0 6.5 21.5h11a1.7 1.7 0 0 0 1.5-2.7L13.5 9.5v-6" /><path d="M7.7 15h8.6" /></>,
  dis: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>,
  zaman: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  konum: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  takvim: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  ara: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  artı: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  yukle: <><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  ampul: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /></>,
  zincir: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
} as const;

export type IkonAdi = keyof typeof YOLLAR;

export function Ikon({ ad, boyut = 16, className = "" }: { ad: IkonAdi; boyut?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={boyut} height={boyut} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {YOLLAR[ad]}
    </svg>
  );
}
