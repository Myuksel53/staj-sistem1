export type Etiket = "karsilaniyor" | "eksik" | "dogrulanmali" | "kanit_bekliyor";

export type ProfilOzeti = {
  sinif?: number | null;
  ortalama?: number | null;
  beceriler: string[]; // kanıtlı beceriler, küçük harfe çevrilmiş
  /** Listelenmiş ama kanıtı olmayan beceriler (beyan). Şartı "karşılıyor" saymaz, "kanıt bekliyor" olarak gösterir. */
  beyanBeceriler?: string[];
  /** beceri adı (küçük harf) → kanıt metni; yalnızca açıklama içindir */
  kanitlar?: Record<string, string>;
};

export type SartSonucu = { etiket: Etiket; profilMetni: string };

/**
 * normalizeKosul biçimleri: "sinif>=3", "ortalama>=2.5", "beceri:python".
 * Tanınmayan veya profilde verisi olmayan koşul → "dogrulanmali" (uydurma yok).
 * Kanıtsız (yalnızca beyan edilmiş) beceri → "kanit_bekliyor": kanıt eklenene kadar uygun sayılmaz ve dışarıya "uygun" diye iletilmez.
 */
export function sartDegerlendir(normalizeKosul: string | null, p: ProfilOzeti): SartSonucu {
  if (!normalizeKosul) return { etiket: "dogrulanmali", profilMetni: "Otomatik karşılaştırılamadı; ilanı kendin kontrol et" };
  const sayisal = normalizeKosul.match(/^(sinif|ortalama)>=(\d+(?:\.\d+)?)$/);
  if (sayisal) {
    const alan = sayisal[1] as "sinif" | "ortalama";
    const deger = p[alan];
    if (deger == null) return { etiket: "dogrulanmali", profilMetni: alan === "sinif" ? "Profilinde sınıf bilgisi yok" : "Profilinde ortalama bilgisi yok" };
    return {
      etiket: deger >= Number(sayisal[2]) ? "karsilaniyor" : "eksik",
      profilMetni: alan === "sinif" ? `${deger}. sınıf` : `${deger} genel not ortalaması`,
    };
  }
  const beceri = normalizeKosul.match(/^beceri:(.+)$/);
  if (beceri) {
    const ad = beceri[1].trim().toLowerCase();
    if (p.beceriler.includes(ad)) {
      const kanit = p.kanitlar?.[ad];
      return { etiket: "karsilaniyor", profilMetni: kanit ? `${ad} (kanıt: ${kanit})` : `${ad} kanıtlı olarak listelenmiş` };
    }
    if (p.beyanBeceriler?.includes(ad)) return { etiket: "kanit_bekliyor", profilMetni: `${ad} listelenmiş ancak kanıt eklenmemiş` };
    return { etiket: "eksik", profilMetni: `${ad} profilinde yok` };
  }
  return { etiket: "dogrulanmali", profilMetni: "Otomatik karşılaştırılamadı; ilanı kendin kontrol et" };
}

export function sartEtiketle(normalizeKosul: string | null, p: ProfilOzeti): Etiket {
  return sartDegerlendir(normalizeKosul, p).etiket;
}
