/** Kullanıcının başka bir siteden kopyaladığı ilan metnini cümle yapısına getirir: madde işaretleri ve satır sonları cümle sınırı olur.
 *  Çıkan şartların alıntıları bu normalleştirilmiş metinden alınır; böylece alıntı doğrulaması yine metinde geçmek zorundadır. */
export function ilanNormalle(metin: string, sinir = 8000): string {
  return metin
    .slice(0, sinir)
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*(?:[•·▪●○◦■□►➢✓✔*\-–—]+|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .map((s) => (/[.!?:]$/.test(s) ? s : `${s}.`))
    .join(" ");
}

/** "Python, C ; git" → ["python","c","git"] */
export function beceriListesi(girdi: string): string[] {
  return [...new Set(girdi.split(/[,;\n]/).map((s) => s.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))].slice(0, 40);
}
