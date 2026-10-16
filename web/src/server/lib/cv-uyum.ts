import { cvBecerileri } from "./cv";

export type UyumGirdi = { id: string; baslik: string; aciklama: string | null; benzerlik: number };
export type Uyum = { puan: number; eslesen: string[]; eksik: string[]; anlamsal: number; beceriOrani: number | null };

const AGIRLIK_ANLAMSAL = 0.6;
const AGIRLIK_BECERI = 0.4;

/** Her ilan için uyum puanı (0-100).
 *  - anlamsal: yerel dil modelinin CV ↔ ilan benzerliği, aday listesi içinde 0-1'e ölçeklenir (ham değerler dar aralıkta toplandığı için).
 *  - beceri: ilan metninde geçen becerilerin kaçı CV'de var. İlan beceri saymıyorsa nötr (0.5) alınır, cezalandırılmaz.
 *  Puan bir "olasılık" değil, sıralama için bir ölçüdür; gerekçe olarak eşleşen/eksik beceriler gösterilir. */
export function uyumHesapla(cvBeceri: string[], ilanlar: UyumGirdi[]): Map<string, Uyum> {
  const cv = new Set(cvBeceri);
  const sims = ilanlar.map((i) => i.benzerlik);
  const en = Math.min(...sims), ek = Math.max(...sims);
  const sonuc = new Map<string, Uyum>();
  for (const i of ilanlar) {
    const anlamsal = ek === en ? 0.5 : (i.benzerlik - en) / (ek - en);
    const ilanBeceri = cvBecerileri(`${i.baslik}. ${i.aciklama ?? ""}`);
    const eslesen = ilanBeceri.filter((b) => cv.has(b));
    const eksik = ilanBeceri.filter((b) => !cv.has(b));
    const beceriOrani = ilanBeceri.length ? eslesen.length / ilanBeceri.length : null;
    const bilesik = AGIRLIK_ANLAMSAL * anlamsal + AGIRLIK_BECERI * (beceriOrani ?? 0.5);
    sonuc.set(i.id, { puan: Math.round(40 + bilesik * 58), eslesen, eksik, anlamsal, beceriOrani });
  }
  return sonuc;
}
