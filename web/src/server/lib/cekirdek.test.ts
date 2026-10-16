import { describe, expect, it } from "vitest";
import { Cekirdek } from "../../../scripts/cekirdek-sema";

const gecerli = {
  kurum: { ad: "Test Üniversitesi", tur: "universite" },
  tur: "arastirma_staji", baslik: "Yaz stajı",
  aciklama: "Bu bir test açıklamasıdır ve en az otuz karakter uzunluğundadır.",
  durum: "acik", kaynak: { url: "https://example.edu/staj", tur: "resmi_sayfa" },
};
describe("Cekirdek şeması", () => {
  it("geçerli kaydı kabul eder", () => expect(Cekirdek.safeParse({ kayitlar: [gecerli] }).success).toBe(true));
  it("kaynaksız kaydı reddeder", () => {
    const { kaynak, ...kaynaksiz } = gecerli; void kaynak;
    expect(Cekirdek.safeParse({ kayitlar: [kaynaksiz] }).success).toBe(false);
  });
});
