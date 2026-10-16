import { db } from "@/db";
import { kaynakKutuphanesi } from "@/db/schema";

type AnalizSatiri = { normalizeKosul: string | null; etiket: string };
type Kutuphane = { id?: string; beceri: string; baslik: string; url: string; tur: string; sureSaat: number | null };

/** Eksik "beceri:x" şartlarından beceri adlarını çıkarır. */
export function eksikBecerileriCikar(analiz: AnalizSatiri[]): string[] {
  const set = new Set<string>();
  for (const s of analiz) {
    const m = s.etiket === "eksik" && s.normalizeKosul?.match(/^beceri:(.+)$/);
    if (m) set.add(m[1].trim().toLowerCase());
  }
  return [...set];
}

/** Kütüphane becerisi, eksik beceri adının tam sözcüklerinden biriyse eşleşir ("ağ temelleri" ↔ "ağ"). "java" ↔ "javascript" ya da "c" ↔ "c++" eşleşmez. */
export function becerilerEsler(eksik: string, kutuphaneBecerisi: string): boolean {
  if (eksik === kutuphaneBecerisi) return true;
  return ` ${eksik} `.includes(` ${kutuphaneBecerisi} `);
}

/** Yalnızca kütüphanedeki kayıtlara bağlanır; kütüphanede olmayan beceri için kaynak=[] (link uydurulmaz). */
export function kaynaklariEsle(eksikler: string[], kutuphane: Kutuphane[]) {
  return eksikler.map((beceri) => ({ beceri, kaynaklar: kutuphane.filter((k) => becerilerEsler(beceri, k.beceri)) }));
}

export async function yolHaritasi(analiz: AnalizSatiri[]) {
  const eksikler = eksikBecerileriCikar(analiz);
  if (!eksikler.length) return [];
  const kutuphane = await db.select().from(kaynakKutuphanesi); // küçük tablo; sözcük eşleşmesi bellekte yapılır
  return kaynaklariEsle(eksikler, kutuphane);
}
