import { describe, expect, it } from "vitest";
import { hocaBazliTopla } from "./hocabul";
import { eksikBecerileriCikar, kaynaklariEsle } from "./yolharitasi";
import { yakinIller } from "./yakin-iller";
import { sehirUygun } from "./alternatif";
import { yeniOlanlar } from "./radar";

describe("hocaBazliTopla", () => {
  const s = [{ akademisyenId: "a", b: 1 }, { akademisyenId: "b", b: 2 }, { akademisyenId: "a", b: 3 },
    { akademisyenId: "a", b: 4 }, { akademisyenId: "a", b: 5 }];
  it("sırayı korur, hoca başına en fazla 3 yayın", () => {
    const g = hocaBazliTopla(s);
    expect(g.map((x) => x[0].akademisyenId)).toEqual(["a", "b"]);
    expect(g[0]).toHaveLength(3);
  });
  it("hoca sayısını sınırlar", () => expect(hocaBazliTopla(s, 1)).toHaveLength(1));
});

describe("yol haritası", () => {
  it("yalnızca eksik beceri şartlarını alır", () =>
    expect(eksikBecerileriCikar([
      { normalizeKosul: "beceri:Python", etiket: "eksik" },
      { normalizeKosul: "beceri:rust", etiket: "karsilaniyor" },
      { normalizeKosul: "sinif>=3", etiket: "eksik" },
    ])).toEqual(["python"]));
  it("kütüphanede yoksa boş kaynak döner, link uydurmaz", () => {
    const [r] = kaynaklariEsle(["rust"], [{ beceri: "python", baslik: "x", url: "https://x", tur: "kurs", sureSaat: null }]);
    expect(r.kaynaklar).toEqual([]);
  });
});

describe("yakın iller ve alternatif şehir", () => {
  it("simetrik okur", () => expect(yakinIller("kocaeli")).toContain("İstanbul"));
  it("yakın il uygun, uzak il değil", () => {
    expect(sehirUygun({ sehir: "Kocaeli", uzaktan: false }, "İstanbul")).toBe(true);
    expect(sehirUygun({ sehir: "Adana", uzaktan: false }, "İstanbul")).toBe(false);
  });
  it("uzaktan ilan her zaman uygun", () => expect(sehirUygun({ sehir: "Adana", uzaktan: true }, "İstanbul")).toBe(true));
});

describe("yeniOlanlar", () => {
  const a = [{ olusturma: new Date("2026-10-01") }, { olusturma: new Date("2026-10-10") }];
  it("son çalışmadan sonrakiler", () => expect(yeniOlanlar(a, new Date("2026-10-05"))).toHaveLength(1));
  it("ilk çalışmada hepsi", () => expect(yeniOlanlar(a, null)).toHaveLength(2));
});

import { Kutuphane } from "../../../scripts/kutuphane-sema";
describe("Kutuphane şeması", () => {
  const k = { beceri: " Python ", baslik: "Resmî eğitim", url: "https://docs.python.org/3/tutorial/", tur: "dokuman" };
  it("beceriyi küçük harfe çevirip kırpar", () =>
    expect(Kutuphane.parse({ kaynaklar: [k] }).kaynaklar[0].beceri).toBe("python"));
  it("http linki reddeder", () =>
    expect(Kutuphane.safeParse({ kaynaklar: [{ ...k, url: "http://x.com" }] }).success).toBe(false));
  it("bilinmeyen türü reddeder", () =>
    expect(Kutuphane.safeParse({ kaynaklar: [{ ...k, tur: "video" }] }).success).toBe(false));
});
