const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");

/** Koruma kuralı: alıntı kaynak metinde birebir (boşluk/büyük-küçük harf farkı hariç) geçmelidir. */
export function alintiGecerli(alinti: string, kaynakMetin: string): boolean {
  const a = norm(alinti);
  return a.length >= 8 && norm(kaynakMetin).includes(a);
}
