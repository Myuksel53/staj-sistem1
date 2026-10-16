import { describe, expect, it } from "vitest";
import { kuralEposta, kuralSartlari, kuralSiralama } from "./ai/kural";
import { alintiGecerli } from "./ai/alinti";

const ilan = "Adaylar en az 3. sınıf öğrencisi olmalıdır. C programlama dili bilgisi zorunludur. RTOS deneyimi tercih edilir. Genel not ortalaması en az 2.50 olmalıdır. C veya Python bilgisi zorunludur.";

describe("kuralSartlari", () => {
  const s = kuralSartlari(ilan);
  const k = (n: string) => s.find((x) => x.normalizeKosul === n);
  it("sınıf, ortalama ve becerileri çıkarır", () => {
    expect(k("sinif>=3")?.tur).toBe("zorunlu");
    expect(k("ortalama>=2.50")).toBeTruthy();
    expect(k("beceri:c")?.tur).toBe("zorunlu");
    expect(k("beceri:rtos")?.tur).toBe("tercih");
  });
  it("seçenekli beceriyi uydurmaz: normalizeKosul null", () =>
    expect(s.find((x) => x.metin.includes("veya"))?.normalizeKosul).toBeNull());
  it("her alıntı ilan metninde geçer", () => s.forEach((x) => expect(alintiGecerli(x.alinti, ilan)).toBe(true)));
});

describe("kuralSartlari: gerçek program kalıpları", () => {
  const tusas = "Mühendislik fakültesinde 3. veya 4. sınıf öğrencisi olmak ve genel not ortalaması en az 3.00 olmak gerekir. Staj öğrencinin müfredatında zorunlu olmalıdır.";
  const s = kuralSartlari(tusas);
  it("tek cümleden hem sınıf hem ortalama çıkarır", () => {
    expect(s.map((x) => x.normalizeKosul)).toEqual(expect.arrayContaining(["sinif>=3", "ortalama>=3.00"]));
  });
  it("genel koşulu normalizeKosul null ile 'doğrulanmalı' bırakır", () => {
    const g = kuralSartlari("Başvuru için ARBİS kaydı ve akademik danışman gerekir.");
    expect(g).toHaveLength(1);
    expect(g[0].normalizeKosul).toBeNull();
  });
  it("her alıntı kaynak metinde geçer", () => s.forEach((x) => expect(alintiGecerli(x.alinti, tusas)).toBe(true)));
});

describe("kuralSiralama", () => {
  const a = [
    { firsatId: "1", baslik: "A", kurum: "K", metin: "Birinci ilan metni burada.", benzerlik: 0.86 },
    { firsatId: "2", baslik: "B", kurum: "K", metin: "İkinci ilan metni burada.", benzerlik: 0.83 },
  ];
  it("benzerliğe göre sıralar ve 40–95'e ölçekler", () => {
    const r = kuralSiralama(a);
    expect(r.map((x) => x.firsatId)).toEqual(["1", "2"]);
    expect([r[0].puan, r[1].puan]).toEqual([95, 40]);
  });
  it("gerekçe alıntısı ilandan gelir", () =>
    expect(alintiGecerli(kuralSiralama(a)[0].gerekceler[0].alinti, a[0].metin)).toBe(true));
});

describe("kuralEposta", () => {
  it("yalnızca verilen becerileri ve alanları kullanır", () => {
    const t = kuralEposta({ kullaniciAdi: "", hedefAdi: "Dr. X", hedefTuru: "akademisyen",
      kanitliBeceriler: [{ ad: "Python", kanit: "bitirme projesi" }], dogrulanmisCalismaAlanlari: ["görüntü işleme"] });
    expect(t).toContain("Python (bitirme projesi)");
    expect(t).toContain("görüntü işleme");
    expect(t).toContain("[Ad Soyad]");
  });
});
