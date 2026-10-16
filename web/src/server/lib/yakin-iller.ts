// Yaklaşık komşuluk tablosu (alternatif bulucu için). Eksik il eklemek serbest; simetrik olarak okunur.
const CIFTLER: [string, string[]][] = [
  ["İstanbul", ["Kocaeli", "Tekirdağ", "Kırklareli", "Sakarya", "Bursa"]],
  ["Ankara", ["Eskişehir", "Kırıkkale", "Çankırı", "Bolu", "Kırşehir"]],
  ["İzmir", ["Manisa", "Aydın", "Balıkesir"]],
  ["Kocaeli", ["Sakarya", "Bursa"]],
];
const tr = (s: string) => s.toLocaleLowerCase("tr");

export function yakinIller(sehir: string): string[] {
  const hedef = tr(sehir);
  const sonuc = new Set<string>();
  for (const [il, komsular] of CIFTLER) {
    if (tr(il) === hedef) komsular.forEach((k) => sonuc.add(k));
    else if (komsular.some((k) => tr(k) === hedef)) sonuc.add(il);
  }
  return [...sonuc];
}
