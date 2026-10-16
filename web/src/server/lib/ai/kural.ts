// Anthropic anahtarı yokken kullanılan, LLM'siz kural tabanlı yedekler.
// Hepsi alıntıyı doğrudan kaynak cümleden alır, bu yüzden alıntı doğrulaması her zaman geçer.
import type { CikarilanSart, EpostaGirdi, SiralamaAdayi, SiralanmisAday } from "./claude";

export const cumleler = (metin: string) => metin.split(/(?<=[.!?])(?<!\d\.)\s+/).map((c) => c.trim()).filter(Boolean);

const BECERI_ATIK = /\s+(programlama dili|dili|bilgisi|deneyimi|kullanımı|tecrübesi)(?=\s|$)/gi;

/** "Python bilgisi zorunludur." → python; "C veya Python" gibi seçenekli ifade → null (doğrulanmalı). */
function becerAdi(cumle: string): string | null {
  const m = cumle.match(/^(.*?)\s+(?:zorunludur|tercih edilir|aranır)\.?$/i);
  if (!m) return null;
  const ad = m[1].replace(BECERI_ATIK, "").trim().toLocaleLowerCase("tr");
  return ad && !/\sveya\s/.test(ad) ? ad : null;
}

export function kuralSartlari(ilanMetni: string): CikarilanSart[] {
  const sonuc: CikarilanSart[] = [];
  for (const c of cumleler(ilanMetni)) {
    // Bir cümle hem sınıf hem ortalama şartı taşıyabilir; ikisi de alıntıyı aynı cümleden alır.
    const sinif = c.match(/(?:en az\s+)?(\d)\.\s*(?:(?:veya|ya da|ve)\s*\d\.\s*)?sınıf/i);
    const ort = c.match(/ortalama\S*\s+en az\s+(\d+[.,]\d+)/i);
    if (sinif) sonuc.push({ metin: c, alinti: c, tur: "zorunlu", normalizeKosul: `sinif>=${sinif[1]}` });
    if (ort) sonuc.push({ metin: c, alinti: c, tur: "zorunlu", normalizeKosul: `ortalama>=${ort[1].replace(",", ".")}` });
    if (sinif || ort) continue;
    const zorunlu = /zorunludur\.?$/i.test(c), tercih = /tercih edilir\.?$/i.test(c);
    if (zorunlu || tercih) {
      const ad = becerAdi(c);
      sonuc.push({ metin: c, alinti: c, tur: zorunlu ? "zorunlu" : "tercih", normalizeKosul: ad ? `beceri:${ad}` : null });
    } else if (/(gerekir|gerekmektedir|olmalıdır)\.?$/i.test(c)) {
      // Genel koşul (ör. "ARBİS kaydı gerekir"): otomatik karşılaştırılamaz, kullanıcıya "doğrulanmalı" olarak gösterilir.
      sonuc.push({ metin: c, alinti: c, tur: "zorunlu", normalizeKosul: null });
    }
  }
  return sonuc;
}

/** Benzerlik puanlarını adaylar arasında 40–95'e ölçekler (e5 benzerlikleri dar aralıkta toplanır). */
export function kuralSiralama(adaylar: SiralamaAdayi[]): SiralanmisAday[] {
  const b = adaylar.map((a) => a.benzerlik ?? 0);
  const en = Math.min(...b), ek = Math.max(...b);
  return adaylar
    .map((a) => {
      const gerekce = cumleler(a.metin).find((c) => c.length >= 8) ?? a.baslik;
      const olcek = ek === en ? 0.5 : ((a.benzerlik ?? 0) - en) / (ek - en);
      return {
        firsatId: a.firsatId, puan: Math.round(40 + olcek * 55),
        gerekceler: [{ metin: "İlgi alanınla anlamsal olarak yakın (otomatik benzerlik)", alinti: gerekce }],
      };
    })
    .sort((x, y) => y.puan - x.puan);
}

export function kuralEposta(g: EpostaGirdi): string {
  const beceri = g.kanitliBeceriler.map((b) => `${b.ad} (${b.kanit})`).join("; ");
  const alan = g.dogrulanmisCalismaAlanlari.slice(0, 3).join("; ");
  const ilgi = g.hedefTuru === "akademisyen"
    ? `Çalışma alanlarınızdan (${alan}) etkilendim ve araştırma grubunuzda staj yapma imkânını sormak istiyorum.`
    : `${g.hedefAdi} bünyesindeki staj fırsatıyla ilgileniyorum.`;
  return [
    `Konu: Staj başvurusu${g.hedefTuru === "akademisyen" ? " / araştırma stajı" : ""}`, "",
    `Sayın ${g.hedefAdi},`, "", ilgi,
    beceri ? `İlgili deneyimlerim: ${beceri}.` : "Deneyimlerimi görüşmede ayrıntılı anlatmak isterim.",
    "Uygun görürseniz özgeçmişimi paylaşabilirim.", "", "Saygılarımla,", g.kullaniciAdi || "[Ad Soyad]",
  ].join("\n");
}
