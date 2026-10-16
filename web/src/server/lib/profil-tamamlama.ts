export type ProfilGirdi = {
  bolum?: string | null;
  sinif?: number | null;
  ilgiAlanlari?: string | null;
  sehir?: string | null;
};
export type BeceriGirdi = { ad: string; kanit?: string | null };

export type TamamlamaMaddesi = { anahtar: string; ad: string; agirlik: number; tamam: boolean; neden: string };

/** Profilin ne kadarının dolu olduğunu ve eksik her maddenin kullanıcıya NEDEN yararlı olduğunu hesaplar.
 *  Ortalama isteğe bağlıdır ve puana dahil değildir (girmek zorunda değilsin). Ağırlıklar toplamı 100. */
export function profilTamamlama(p: ProfilGirdi | null | undefined, beceriler: BeceriGirdi[]) {
  const kanitli = beceriler.filter((b) => (b.kanit ?? "").trim().length > 0);
  const maddeler: TamamlamaMaddesi[] = [
    { anahtar: "bolum", ad: "Bölüm", agirlik: 10, tamam: !!p?.bolum?.trim(), neden: "Bölümüne uygun programlar öne çıkar." },
    { anahtar: "sinif", ad: "Sınıf", agirlik: 15, tamam: !!p?.sinif, neden: "Birçok program belirli sınıfı arar; uygunluk analizi sınıfına bakar." },
    { anahtar: "ilgi", ad: "İlgi alanları", agirlik: 25, tamam: (p?.ilgiAlanlari ?? "").trim().length >= 10, neden: "Eşleştirme bu metne göre yapılır; ne kadar net yazarsan sonuç o kadar isabetli olur." },
    { anahtar: "sehir", ad: "Şehir", agirlik: 10, tamam: !!p?.sehir?.trim(), neden: "Yakın şehirdeki fırsatları ve üniversiteleri gösterebiliriz." },
    { anahtar: "beceri", ad: "En az bir beceri", agirlik: 20, tamam: beceriler.length > 0, neden: "İlandaki beceri şartlarıyla karşılaştırmak için gerekir." },
    { anahtar: "kanit", ad: "Kanıtlı bir beceri", agirlik: 20, tamam: kanitli.length > 0, neden: "E-posta taslağı yalnızca kanıtı olan becerileri yazar (proje, sertifika, ders)." },
  ];
  const yuzde = maddeler.filter((m) => m.tamam).reduce((t, m) => t + m.agirlik, 0);
  return { yuzde, maddeler, eksikler: maddeler.filter((m) => !m.tamam) };
}
