import { describe, expect, it } from "vitest";
import { anahtarGecer, anahtarlar, bagilGecer, konuPuanDuzelt, konularTespit } from "./konu";

describe("konu kapısı", () => {
  const siber = anahtarlar(["Siber güvenlik"]);
  it("siber seçilince web stajı geçmez", () => {
    expect(anahtarGecer("Web Geliştirme Stajyeri. React ve CSS bilgisi tercih edilir.", siber)).toBe(false);
  });
  it("siber seçilince ağ güvenliği ilanı geçer", () => {
    expect(anahtarGecer("Ağ Güvenliği Araştırma Stajı. Sızma testi.", siber)).toBe(true);
    expect(anahtarGecer("Cybersecurity internship", siber)).toBe(true);
  });
  it("güvenliği gibi ek almış biçimleri de yakalar", () => expect(anahtarGecer("Ağ Güvenliği Araştırma Stajı", siber)).toBe(true));
  it("genel 'security/politika' kelimesi siber sayılmaz", () => {
    expect(anahtarGecer("Security, Politics, and Digital Transformation. Economic and Fiscal Studies", siber)).toBe(false);
  });
  it("büyük/küçük harf ve Türkçe İ fark etmez", () => expect(anahtarGecer("SİBER SALDIRI ANALİZİ", siber)).toBe(true));
  it("bilinmeyen konu (beceri listesi) kapıyı uygulamaz", () => {
    expect(anahtarlar(["python", "docker"])).toEqual([]);
    expect(anahtarGecer("herhangi bir metin", [])).toBe(true);
  });
  it("birden çok konu birleşir", () => {
    const k = anahtarlar(["Siber güvenlik", "Robotik"]);
    expect(anahtarGecer("Mobil robotik projesi", k)).toBe(true);
    expect(anahtarGecer("Web arayüzü", k)).toBe(false);
  });
});

describe("bagilGecer", () => {
  it("en iyiye yakın olanı tutar, uzak olanı atar", () => {
    expect(bagilGecer(0.84, 0.86)).toBe(true);
    expect(bagilGecer(0.80, 0.86)).toBe(false);
  });
});

describe("konularTespit ve konuPuanDuzelt", () => {
  const profil = konularTespit("siber güvenlik, ağ güvenliği ve yapay zeka");
  it("profil metninden konuları bulur", () => expect(profil).toEqual(expect.arrayContaining(["Siber güvenlik", "Yapay zeka"])));
  it("ilan metninden konuyu bulur", () => expect(konularTespit("Web Geliştirme Stajyeri. React ile arayüz")).toContain("Yazılım geliştirme"));
  it("konusu örtüşen ilanı yükseltir", () => expect(konuPuanDuzelt(80, profil, ["Siber güvenlik"])).toBe(88));
  it("yalnızca başka konudaki ilanı düşürür", () => expect(konuPuanDuzelt(69, profil, ["Yazılım geliştirme"])).toBe(54));
  it("genel programa (konusuz) dokunmaz", () => expect(konuPuanDuzelt(69, profil, [])).toBe(69));
  it("kullanıcı konu belirtmemişse dokunmaz", () => expect(konuPuanDuzelt(69, [], ["Robotik"])).toBe(69));
  it("sınırları aşmaz", () => { expect(konuPuanDuzelt(97, profil, ["Siber güvenlik"])).toBe(98); expect(konuPuanDuzelt(45, profil, ["Robotik"])).toBe(40); });
});
