import { describe, expect, it } from "vitest";
import { beceriListesi, ilanNormalle } from "./ilan-yapistir";
import { kuralSartlari } from "./ai/kural";
import { alintiGecerli } from "./ai/alinti";

const kopya = `Aranan Nitelikler
• Bilgisayar Mühendisliği 3. sınıf öğrencisi olmak
- Python bilgisi zorunludur
- Genel not ortalaması en az 2.50 olmalıdır
* Git kullanımı tercih edilir`;

describe("ilanNormalle", () => {
  const n = ilanNormalle(kopya);
  it("madde işaretlerini ve satırları cümleye çevirir", () => {
    expect(n).toContain("Python bilgisi zorunludur.");
    expect(n).not.toMatch(/•|\n/);
  });
  it("siteden kopyalanan metinden şart çıkarır ve alıntı metinde geçer", () => {
    const s = kuralSartlari(n);
    expect(s.map((x) => x.normalizeKosul)).toEqual(expect.arrayContaining(["beceri:python", "ortalama>=2.50", "beceri:git"]));
    s.forEach((x) => expect(alintiGecerli(x.alinti, n)).toBe(true));
  });
  it("girdiyi sınırlar", () => expect(ilanNormalle("a\n".repeat(9000), 100).split("a.").length - 1).toBeLessThanOrEqual(50));
});

describe("beceriListesi", () => {
  it("ayırır, küçültür, tekrarı atar", () => expect(beceriListesi("Python, C ; python\nGit")).toEqual(["python", "c", "git"]));
});
