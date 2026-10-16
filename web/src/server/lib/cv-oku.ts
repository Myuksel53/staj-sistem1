import { extractText, getDocumentProxy } from "unpdf";

export const CV_BOYUT_SINIRI = 5 * 1024 * 1024;

/** Yüklenen CV'den düz metin çıkarır. Dosya diske yazılmaz; yalnızca bu istekte bellekte tutulur. */
export async function cvMetni(dosya: File): Promise<string> {
  if (dosya.size > CV_BOYUT_SINIRI) throw new Error("Dosya 5 MB'tan büyük. Daha küçük bir PDF yükle ya da metni yapıştır.");
  const bayt = new Uint8Array(await dosya.arrayBuffer());
  const pdfMi = bayt.length > 4 && String.fromCharCode(...bayt.slice(0, 4)) === "%PDF";
  if (pdfMi) {
    try {
      const pdf = await getDocumentProxy(bayt);
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    } catch {
      throw new Error("PDF okunamadı. Şifreli ya da bozuk olabilir; metni yapıştırmayı dene.");
    }
  }
  if (dosya.type.startsWith("text/") || dosya.name.toLowerCase().endsWith(".txt")) return new TextDecoder().decode(bayt);
  throw new Error("Yalnızca PDF veya düz metin (.txt) destekleniyor. Word dosyası için metni kopyalayıp aşağıya yapıştır.");
}
