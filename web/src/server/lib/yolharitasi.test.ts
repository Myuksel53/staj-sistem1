import { describe, expect, it } from "vitest";
import { becerilerEsler, kaynaklariEsle } from "./yolharitasi";

const k = (beceri: string) => ({ beceri, baslik: beceri, url: `https://x/${beceri}`, tur: "kurs", sureSaat: null });

describe("becerilerEsler", () => {
  it("birebir ve tam sözcük eşleşir", () => {
    expect(becerilerEsler("linux", "linux")).toBe(true);
    expect(becerilerEsler("ağ temelleri", "ağ")).toBe(true);
    expect(becerilerEsler("temel python", "python")).toBe(true);
  });
  it("sözcüğün parçası ya da komşu dil eşleşmez", () => {
    expect(becerilerEsler("javascript", "java")).toBe(false);
    expect(becerilerEsler("c++", "c")).toBe(false);
    expect(becerilerEsler("react native", "react")).toBe(true);
    expect(becerilerEsler("ağırlık", "ağ")).toBe(false);
  });
});

describe("kaynaklariEsle", () => {
  it("kütüphanede olmayan beceriye kaynak uydurmaz", () => {
    expect(kaynaklariEsle(["rust"], [k("python")])[0].kaynaklar).toEqual([]);
  });
  it("bileşik beceri adına kütüphane kaynağını bağlar", () => {
    expect(kaynaklariEsle(["ağ temelleri"], [k("ağ"), k("python")])[0].kaynaklar.map((x) => x.beceri)).toEqual(["ağ"]);
  });
});
