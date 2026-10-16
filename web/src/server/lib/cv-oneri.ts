import { cvBecerileri } from "./cv";
import { kaynaklariEsle } from "./yolharitasi";

type Kutuphane = { beceri: string; baslik: string; url: string; tur: string; sureSaat: number | null };

/** Alan adları (somut beceri değil): "eksik beceri" olarak önerilmez. CV'de OpenCV/STM32 geçerken "görüntü işleme" ya da "gömülü sistemler"i eksik göstermek yanıltıcı olur. */
const ALAN_ADLARI = new Set(["görüntü işleme", "gömülü sistemler", "machine learning", "nlp", "robotik", "siber güvenlik", "veri analizi", "ağ", "iot", "5g", "devre tasarımı", "rest api"]);

export type EksikBeceri = { beceri: string; ilanSayisi: number; kaynaklar: Kutuphane[] };

/** Alandaki ilanlarda geçen ama CV'de olmayan becerileri, kaç ilanda geçtiğine göre sıralar; her biri için kütüphanedeki öğrenme kaynaklarını bağlar.
 *  Sayılar yalnızca elimizdeki ilanlardan gelir (sınırlı veri); "piyasada en çok aranan" iddiası değildir. */
export function eksikBeceriOnerileri(cvBeceri: string[], ilanlar: { baslik: string; aciklama: string | null }[], kutuphane: Kutuphane[], adet = 5): EksikBeceri[] {
  const cv = new Set(cvBeceri);
  const sayac = new Map<string, number>();
  for (const i of ilanlar) {
    for (const b of new Set(cvBecerileri(`${i.baslik}. ${i.aciklama ?? ""}`))) if (!cv.has(b) && !ALAN_ADLARI.has(b)) sayac.set(b, (sayac.get(b) ?? 0) + 1);
  }
  const sirali = [...sayac].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr")).slice(0, adet);
  const esle = kaynaklariEsle(sirali.map(([b]) => b), kutuphane);
  return sirali.map(([beceri, ilanSayisi], n) => ({ beceri, ilanSayisi, kaynaklar: esle[n].kaynaklar }));
}

/** Eşleşen laboratuvarlarda en sık geçen araştırma konuları (alanın nereye gittiğini gösterir). */
export function alanKonulari(gruplar: { konular: string[] }[], adet = 8): { konu: string; sayi: number }[] {
  const s = new Map<string, number>();
  for (const g of gruplar) for (const k of new Set(g.konular.map((x) => x.trim().toLocaleLowerCase("tr-TR")))) s.set(k, (s.get(k) ?? 0) + 1);
  return [...s].map(([konu, sayi]) => ({ konu, sayi })).sort((a, b) => b.sayi - a.sayi || a.konu.localeCompare(b.konu, "tr")).slice(0, adet);
}

export type Gozlem = { iyi: boolean; metin: string };

/** CV metnine bakan basit, açıklanabilir gözlemler. Bir değerlendirme ya da puan değildir; sadece sık eksikleri hatırlatır. */
export function cvGozlemleri(ham: string, beceriSayisi: number): Gozlem[] {
  const kelime = ham.trim().split(/\s+/).filter(Boolean).length;
  const g: Gozlem[] = [];
  g.push(/github\.com|gitlab\.com|bitbucket\.org|portfolyo|portfolio/i.test(ham)
    ? { iyi: true, metin: "GitHub ya da portfolyo bağlantısı var." }
    : { iyi: false, metin: "GitHub ya da portfolyo bağlantısı ekle: işverenler ve hocalar kodunu görmek ister." });
  g.push((ham.match(/proje|project/gi) ?? []).length >= 2
    ? { iyi: true, metin: "Projelerinden söz ediyorsun." }
    : { iyi: false, metin: "Projelerini ayrı bir bölümde anlat: ne yaptın, hangi teknolojiyi kullandın, sonuç neydi." });
  g.push(/\d+\s*%|%\s*\d+|\b\d{2,}\s*(kullanıcı|kişi|saat|ms|saniye|kat|puan|veri|örnek)/i.test(ham)
    ? { iyi: true, metin: "Sonuçları sayıyla anlatan ifadeler var." }
    : { iyi: false, metin: "Sonuçları sayıyla anlat (ör. “doğruluk %92”, “3 kat hızlandı”). Sayı, iddiayı inandırıcı kılar." });
  if (beceriSayisi < 4) g.push({ iyi: false, metin: "Teknik becerileri (diller, araçlar, kütüphaneler) ayrı bir listede topla; şu an az beceri yakalandı." });
  if (kelime < 120) g.push({ iyi: false, metin: "CV çok kısa görünüyor. Staj için tek sayfa ama dolu olması iyidir: eğitim, projeler, beceriler." });
  else if (kelime > 900) g.push({ iyi: false, metin: "CV uzun görünüyor. Staj başvurusu için tek sayfaya indirmek okunurluğu artırır." });
  return g.slice(0, 5);
}
