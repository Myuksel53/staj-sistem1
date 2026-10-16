import { describe, expect, it } from "vitest";
import { uyumHesapla } from "./cv-uyum";

const ilanlar = [
  { id: "a", baslik: "Python Stajı", aciklama: "Python ve Docker bilgisi gerekir.", benzerlik: 0.86 },
  { id: "b", baslik: "Genel Staj", aciklama: "Motive bir stajyer arıyoruz.", benzerlik: 0.84 },
  { id: "c", baslik: "C Gömülü", aciklama: "C ve RTOS bilgisi tercih edilir.", benzerlik: 0.82 },
];

describe("uyumHesapla", () => {
  const u = uyumHesapla(["python", "docker"], ilanlar);
  it("becerisi örtüşen ve anlamsal olarak yakın ilan en yüksek puanı alır", () => {
    expect(u.get("a")!.puan).toBeGreaterThan(u.get("b")!.puan);
    expect(u.get("b")!.puan).toBeGreaterThan(u.get("c")!.puan);
  });
  it("eşleşen ve eksik becerileri ayırır", () => {
    expect(u.get("a")!.eslesen).toEqual(expect.arrayContaining(["python", "docker"]));
    expect(u.get("c")!.eksik).toEqual(expect.arrayContaining(["c", "rtos"]));
  });
  it("beceri saymayan ilan cezalandırılmaz, nötr kalır", () => expect(u.get("b")!.beceriOrani).toBeNull());
  it("puanlar 40-98 arasında", () => [...u.values()].forEach((x) => { expect(x.puan).toBeGreaterThanOrEqual(40); expect(x.puan).toBeLessThanOrEqual(98); }));
  it("tek ilanda hata vermez", () => expect(uyumHesapla([], [ilanlar[0]]).get("a")!.puan).toBeGreaterThanOrEqual(40));
});
