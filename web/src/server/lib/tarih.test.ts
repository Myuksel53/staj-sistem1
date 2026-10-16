import { describe, expect, it } from "vitest";
import { aciliyet, kalanGun, kalanMetni } from "./tarih";

const bugun = new Date(2026, 9, 15); // 15 Ekim 2026

describe("kalanGun", () => {
  it("gelecek tarih için gün sayar", () => expect(kalanGun("2026-11-11", bugun)).toBe(27));
  it("bugün 0, geçmiş negatif", () => {
    expect(kalanGun("2026-10-15", bugun)).toBe(0);
    expect(kalanGun("2026-10-14", bugun)).toBe(-1);
  });
  it("tarih yoksa null", () => {
    expect(kalanGun(null, bugun)).toBeNull();
    expect(kalanGun("bozuk", bugun)).toBeNull();
  });
});

describe("aciliyet ve metin", () => {
  it("eşikleri uygular", () => {
    expect(aciliyet(-1)).toBe("gecti");
    expect(aciliyet(7)).toBe("acil");
    expect(aciliyet(8)).toBe("yakin");
    expect(aciliyet(31)).toBe("rahat");
  });
  it("metni üretir", () => {
    expect(kalanMetni(0)).toBe("son gün bugün");
    expect(kalanMetni(27)).toBe("27 gün kaldı");
    expect(kalanMetni(-2)).toBe("süresi geçti");
  });
});
