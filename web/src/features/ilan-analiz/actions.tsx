"use server";
import { sartlariCikar } from "@/server/lib/ai/claude";
import { Badge } from "@/components/ui";
import { sartEtiketle } from "@/server/lib/eligibility";
import { beceriListesi, ilanNormalle } from "@/server/lib/ilan-yapistir";

export type IlanDurum = { hata?: string; sonuc?: React.ReactNode } | null;

const ETIKET = {
  karsilaniyor: ["Tam karşılıyor", "dogrulama", "dogrulandi"],
  eksik: ["Eksik", "mercan", "uyari"],
  dogrulanmali: ["Doğrulanmalı", "inceleme", "uyari"],
  kanit_bekliyor: ["Kanıt bekliyor", "inceleme", "uyari"],
} as const;

/** Kullanıcının yapıştırdığı ilan metnini işler. İlan sitesine gitmez, hiçbir şey kaydedilmez. */
export async function ilanAnaliz(_onceki: IlanDurum, fd: FormData): Promise<IlanDurum> {
  const metin = ilanNormalle(String(fd.get("ilan") ?? ""));
  if (metin.length < 60) return { hata: "İlan metni çok kısa. İlanın açıklama ve aranan nitelikler bölümünü yapıştır." };
  const sinifHam = Number.parseInt(String(fd.get("sinif") ?? ""), 10);
  const ortHam = Number.parseFloat(String(fd.get("ortalama") ?? "").replace(",", "."));
  const profil = {
    sinif: sinifHam >= 1 && sinifHam <= 6 ? sinifHam : null,
    ortalama: ortHam >= 0 && ortHam <= 4 ? ortHam : null,
    beceriler: beceriListesi(String(fd.get("beceriler") ?? "")),
  };
  const sartlar = (await sartlariCikar(metin)).map((s) => ({ ...s, etiket: sartEtiketle(s.normalizeKosul, profil) }));
  if (sartlar.length === 0) {
    return { sonuc: <p className="kart p-5 text-ink-soft">Bu metinden otomatik şart çıkarılamadı. Şartları ilanı kendin okuyarak kontrol et; sistem emin olmadığı şeyi uydurmaz.</p> };
  }
  return {
    sonuc: (
      <section className="kart p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">İlandaki şartlar ({sartlar.length})</h2>
        <ul className="space-y-3">
          {sartlar.map((s, i) => {
            const [ad, ton, ikon] = ETIKET[s.etiket];
            return (
              <li key={i} className="flex flex-wrap items-start gap-2 text-sm">
                <Badge ton={ton} ikon={ikon}>{ad}</Badge>
                <Badge ton="kum" kose="kare">{s.tur === "zorunlu" ? "zorunlu" : "tercih"}</Badge>
                <q className="min-w-0 flex-1 text-ink-soft">{s.alinti}</q>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink-mute">Her şart, yapıştırdığın metindeki bir cümleye dayanır. “Doğrulanmalı”, bilgi vermediğin ya da otomatik karşılaştırılamayan şarttır. Bu otomatik bir okumadır; ilanı kendin de oku.</p>
      </section>
    ),
  };
}
