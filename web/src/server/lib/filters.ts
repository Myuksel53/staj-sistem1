import { etkinDurum, type FirsatDurumu } from "./freshness";

export type AdayFirsat = {
  sehir: string | null;
  uzaktan: boolean | null;
  durum: FirsatDurumu;
  sonKontrol: Date | null;
  sonBasvuru: Date | null;
  ulke?: string | null; // kurumun ülke kodu
};

export type Tercih = {
  sehir?: string | null;
  ulkeler?: string[] | null; // boş/null: fark etmez
  uzaktan?: boolean | null; // true: yalnızca uzaktan, false: yalnızca yerinde, null: fark etmez
};

/** Aşama 1: kesin filtre (kod). Kapalı ilanlar elenir, "bilinmiyor" kalır ama arayüzde işaretlenir. */
export function kesinFiltre(f: AdayFirsat, t: Tercih, simdi = new Date()): boolean {
  if (etkinDurum(f.durum, f.sonKontrol, f.sonBasvuru, simdi) === "kapali") return false;
  if (t.ulkeler?.length && f.ulke && !t.ulkeler.map((u) => u.toUpperCase()).includes(f.ulke.toUpperCase())) return false;
  if (t.uzaktan === true && f.uzaktan !== true) return false;
  if (t.uzaktan === false && f.uzaktan === true) return false;
  if (t.uzaktan !== true && t.sehir && f.sehir && !f.uzaktan) {
    return f.sehir.toLocaleLowerCase("tr") === t.sehir.toLocaleLowerCase("tr");
  }
  return true;
}
