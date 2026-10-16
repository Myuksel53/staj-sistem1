import { describe, expect, it } from "vitest";
import { etkinDurum } from "./freshness";
import { kesinFiltre } from "./filters";
import { sartDegerlendir, sartEtiketle } from "./eligibility";
import { alintiGecerli } from "./ai/alinti";

const simdi = new Date("2026-10-15T12:00:00Z");
const gunOnce = (n: number) => new Date(simdi.getTime() - n * 86400000);

describe("etkinDurum", () => {
  it("30 günden eski kontrol bilinmiyor olur", () =>
    expect(etkinDurum("acik", gunOnce(31), null, simdi)).toBe("bilinmiyor"));
  it("taze ve açık kalır", () => expect(etkinDurum("acik", gunOnce(2), null, simdi)).toBe("acik"));
  it("son tarihi geçen kapalı olur", () =>
    expect(etkinDurum("acik", gunOnce(1), gunOnce(3), simdi)).toBe("kapali"));
  it("hiç kontrol edilmemiş bilinmiyor", () =>
    expect(etkinDurum("acik", null, null, simdi)).toBe("bilinmiyor"));
});

describe("kesinFiltre", () => {
  const f = { sehir: "İstanbul", uzaktan: false, durum: "acik" as const, sonKontrol: gunOnce(1), sonBasvuru: null };
  it("şehir eşleşir (Türkçe büyük/küçük harf)", () =>
    expect(kesinFiltre(f, { sehir: "istanbul" }, simdi)).toBe(true));
  it("farklı şehir elenir", () => expect(kesinFiltre(f, { sehir: "Ankara" }, simdi)).toBe(false));
  it("uzaktan isteyene yerinde ilan elenir", () =>
    expect(kesinFiltre(f, { uzaktan: true }, simdi)).toBe(false));
  it("kapalı ilan elenir", () =>
    expect(kesinFiltre({ ...f, sonBasvuru: gunOnce(5) }, {}, simdi)).toBe(false));
});

describe("sartEtiketle", () => {
  const p = { sinif: 3, ortalama: null, beceriler: ["python"] };
  it("sınıf karşılanır", () => expect(sartEtiketle("sinif>=3", p)).toBe("karsilaniyor"));
  it("sınıf eksik", () => expect(sartEtiketle("sinif>=4", p)).toBe("eksik"));
  it("veri yoksa doğrulanmalı", () => expect(sartEtiketle("ortalama>=2.5", p)).toBe("dogrulanmali"));
  it("beceri", () => {
    expect(sartEtiketle("beceri:Python", p)).toBe("karsilaniyor");
    expect(sartEtiketle("beceri:rust", p)).toBe("eksik");
  });
  it("tanınmayan koşul doğrulanmalı", () => expect(sartEtiketle(null, p)).toBe("dogrulanmali"));
  it("kanıtsız (beyan) beceri 'kanıt bekliyor' olur, karşılıyor sayılmaz", () => {
    const q = { ...p, beceriler: [], beyanBeceriler: ["python"] };
    expect(sartEtiketle("beceri:python", q)).toBe("kanit_bekliyor");
  });
  it("kanıtlı beceri karşılar, kanıt metnini açıklamaya koyar", () => {
    const r = sartDegerlendir("beceri:python", { ...p, beceriler: ["python"], kanitlar: { python: "Bitirme projesi" } });
    expect(r.etiket).toBe("karsilaniyor");
    expect(r.profilMetni).toContain("Bitirme projesi");
  });
  it("profilde hiç olmayan beceri eksik", () => expect(sartDegerlendir("beceri:rust", { ...p, beyanBeceriler: ["python"] }).etiket).toBe("eksik"));
  it("sınıf açıklaması profil değerini yazar", () => expect(sartDegerlendir("sinif>=3", p).profilMetni).toContain("3. sınıf"));
});

describe("alintiGecerli", () => {
  const metin = "Adaylar   en az 3. sınıf öğrencisi olmalıdır.";
  it("boşluk farkını tolere eder", () => expect(alintiGecerli("en az 3. sınıf öğrencisi", metin)).toBe(true));
  it("uydurma alıntıyı reddeder", () => expect(alintiGecerli("Python bilmek zorunludur", metin)).toBe(false));
});
