import { describe, expect, it } from "vitest";
import { programSirala } from "./kayitli";

const p = (ad: string, kalan: number | null) => ({ ad, kalan });

describe("programSirala", () => {
  it("son tarihi en yakın olan önce gelir", () => {
    expect(programSirala([p("c", 30), p("a", 3), p("b", 10)]).map((x) => x.ad)).toEqual(["a", "b", "c"]);
  });
  it("tarihi olmayanlar sonda, geçmiş tarihliler en sonda", () => {
    expect(programSirala([p("gecti", -2), p("yok", null), p("yakin", 5)]).map((x) => x.ad)).toEqual(["yakin", "yok", "gecti"]);
  });
  it("bugün son gün olan en başta", () => {
    expect(programSirala([p("x", 4), p("bugun", 0)])[0].ad).toBe("bugun");
  });
  it("girdi dizisini değiştirmez", () => {
    const g = [p("b", 9), p("a", 1)];
    programSirala(g);
    expect(g.map((x) => x.ad)).toEqual(["b", "a"]);
  });
  it("boş listede hata vermez", () => expect(programSirala([])).toEqual([]));
});
