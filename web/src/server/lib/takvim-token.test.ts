import { describe, expect, it } from "vitest";
import { takvimAnahtariDogrula, takvimAnahtariUret } from "./takvim-token";

const uid = "285883ad-cc37-4e9f-871a-7f1dfb3c32f9";
const gizli = "test-gizli-deger";

describe("takvim anahtarı", () => {
  it("üretilen anahtar doğrulanır ve kullanıcı kimliğini verir", () => {
    const a = takvimAnahtariUret(uid, gizli)!;
    expect(takvimAnahtariDogrula(a, gizli)).toBe(uid);
  });
  it("başka bir kullanıcının kimliğiyle sahte anahtar reddedilir", () => {
    const a = takvimAnahtariUret(uid, gizli)!;
    const baskasi = "11111111-2222-3333-4444-555555555555";
    expect(takvimAnahtariDogrula(`${baskasi}.${a.split(".").pop()}`, gizli)).toBeNull();
  });
  it("imzası bozulmuş ya da kısa anahtar reddedilir", () => {
    const a = takvimAnahtariUret(uid, gizli)!;
    expect(takvimAnahtariDogrula(a.slice(0, -2) + "xx", gizli)).toBeNull();
    expect(takvimAnahtariDogrula(`${uid}.abc`, gizli)).toBeNull();
    expect(takvimAnahtariDogrula(uid, gizli)).toBeNull();
    expect(takvimAnahtariDogrula("", gizli)).toBeNull();
    expect(takvimAnahtariDogrula(null, gizli)).toBeNull();
  });
  it("farklı gizli değerle üretilen anahtar geçmez", () => {
    expect(takvimAnahtariDogrula(takvimAnahtariUret(uid, "baska")!, gizli)).toBeNull();
  });
  it("gizli değer tanımsızsa hiçbir anahtar üretilmez ya da doğrulanmaz", () => {
    expect(takvimAnahtariUret(uid, undefined)).toBeNull();
    expect(takvimAnahtariDogrula(`${uid}.x`, undefined)).toBeNull();
  });
  it("geçersiz biçimli kullanıcı kimliği reddedilir", () => {
    expect(takvimAnahtariDogrula("../../etc.abc", gizli)).toBeNull();
  });
});
