/** Konu düğmesi → metinde aranacak anahtar sözcükler (küçük harf, Türkçe/İngilizce). Embedding benzerlikleri dar aralıkta toplandığı için
 *  yalnızca embedding'e güvenmeyiz: seçilen konunun sözcüğü geçmeyen kayıt gösterilmez. */
export const KONU_ANAHTAR: Record<string, string[]> = {
  "Makine öğrenmesi": ["makine öğren", "machine learning", "derin öğren", "deep learning", "sinir ağ", "neural", "yapay zek", "yapay zeka"],
  "Yapay zeka": ["yapay zek", "artificial intelligence", "makine öğren", "machine learning", "derin öğren", "deep learning", "doğal dil", "nlp"],
  "Görüntü işleme": ["görüntü", "görsel", "bilgisayarlı görü", "computer vision", "image", "opencv", "örüntü tanı", "pattern recognition"],
  "Gömülü sistemler": ["gömülü", "embedded", "mikrodenetleyici", "microcontroller", "rtos", "firmware", "nesnelerin interneti", "iot"],
  "Robotik": ["robot", "ros ", "slam", "otonom", "autonomous"],
  "Siber güvenlik": ["siber", "cyber", "ağ güvenli", "bilgi güvenli", "sistem güvenli", "information security", "network security", "kriptografi", "cryptograph", "şifrele", "zararlı yazılım", "malware", "intrusion", "saldırı tespit", "mahremiyet", "privacy", "sızma", "authentication", "kimlik doğrula", "blockchain"],
  "Yazılım geliştirme": ["yazılım", "software", "web ", "mobil", "uygulama geliştir", "backend", "frontend", "programlama", "developer"],
  "Veri bilimi": ["veri", "data", "analitik", "analytics", "istatistik", "statistic", "madenciliği", "mining", "big data"],
  "Haberleşme": ["haberleşme", "communication", "5g", "kablosuz", "wireless", "anten", "antenna", "sinyal", "signal", "ağlar", "network"],
  "Güç elektroniği": ["güç elektroni", "power electronic", "motor sürücü", "inverter", "evirici", "dönüştürücü", "converter", "enerji", "yenilenebilir", "renewable"],
  "FPGA / sayısal tasarım": ["fpga", "verilog", "vhdl", "sayısal tasarım", "digital design", "hdl", "asic", "entegre devre"],
};

/** Seçilen konuların birleşik anahtar sözcükleri. Hiçbiri bilinen bir konu değilse (ör. beceri listesi) boş döner = kapı uygulanmaz. */
export function anahtarlar(konular: string[]): string[] {
  return [...new Set(konular.flatMap((k) => KONU_ANAHTAR[k] ?? []))];
}

/** Metin, anahtar sözcüklerden en az birini içeriyor mu? Anahtar boşsa her metin geçer. */
export function anahtarGecer(metin: string, anahtar: string[]): boolean {
  if (anahtar.length === 0) return true;
  const m = ` ${metin.toLocaleLowerCase("tr-TR")} `;
  return anahtar.some((a) => m.includes(a));
}

/** Serbest metinde en iyi sonuca yakın olanları tutar: en iyi benzerlikten `pay` kadar aşağıya inmeyenler. */
export function bagilGecer(benzerlik: number, enIyi: number, pay = 0.04): boolean {
  return benzerlik >= enIyi - pay;
}

/** Serbest metinde hangi konu başlıklarının sözcükleri geçiyor? (profil ilgi alanı ya da ilan metni için). */
export function konularTespit(metin: string): string[] {
  return Object.keys(KONU_ANAHTAR).filter((k) => anahtarGecer(metin, KONU_ANAHTAR[k]));
}

/** Eşleştirme puanını konu uyumuna göre düzeltir:
 *  - ilan, kullanıcının konularından birine giriyorsa +8
 *  - ilan yalnızca BAŞKA konulara giriyorsa (ör. profil siber, ilan web) −15
 *  - ilan hiçbir konuya girmiyorsa (genel program, ör. burs) değişmez.
 *  Kullanıcı konu belirtmemişse (konu listesi boş) puan değişmez. 40–98 aralığında tutulur. */
export function konuPuanDuzelt(puan: number, kullaniciKonulari: string[], ilanKonulari: string[]): number {
  if (kullaniciKonulari.length === 0 || ilanKonulari.length === 0) return puan;
  const ortak = ilanKonulari.some((k) => kullaniciKonulari.includes(k));
  return Math.max(40, Math.min(98, puan + (ortak ? 8 : -15)));
}
