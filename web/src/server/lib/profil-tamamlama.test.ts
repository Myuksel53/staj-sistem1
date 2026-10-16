import { describe, expect, it } from "vitest";
import { profilTamamlama } from "./profil-tamamlama";

describe("profilTamamlama", () => {
  it("ağırlıklar toplamı 100", () => {
    expect(profilTamamlama(null, []).maddeler.reduce((t, m) => t + m.agirlik, 0)).toBe(100);
  });
  it("boş profil %0, tüm maddeler eksik", () => {
    const t = profilTamamlama(null, []);
    expect(t.yuzde).toBe(0);
    expect(t.eksikler).toHaveLength(6);
  });
  it("tam profil %100", () => {
    const t = profilTamamlama({ bolum: "Bilgisayar Mühendisliği", sinif: 3, ilgiAlanlari: "siber güvenlik ve ağ", sehir: "Kocaeli" }, [{ ad: "Python", kanit: "Bitirme projesi" }]);
    expect(t.yuzde).toBe(100);
    expect(t.eksikler).toHaveLength(0);
  });
  it("kanıtsız beceri yalnızca 'beceri' maddesini tamamlar, 'kanıt' eksik kalır", () => {
    const t = profilTamamlama({ bolum: "BM", sinif: 3, ilgiAlanlari: "yapay zeka ve robotik", sehir: "Bursa" }, [{ ad: "Python", kanit: "  " }]);
    expect(t.yuzde).toBe(80);
    expect(t.eksikler.map((m) => m.anahtar)).toEqual(["kanit"]);
  });
  it("10 karakterden kısa ilgi alanı sayılmaz", () => {
    expect(profilTamamlama({ ilgiAlanlari: "ai" }, []).maddeler.find((m) => m.anahtar === "ilgi")?.tamam).toBe(false);
  });
  it("her eksik maddenin nedeni yazılıdır", () => {
    expect(profilTamamlama(null, []).eksikler.every((m) => m.neden.length > 10)).toBe(true);
  });
});
