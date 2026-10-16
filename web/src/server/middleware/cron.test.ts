import { describe, expect, it } from "vitest";
import { cronYetkisi } from "./cron";

const istek = (baslik?: string) => new Request("http://x", { headers: baslik ? { authorization: baslik } : {} });

describe("cronYetkisi", () => {
  it("doğru Bearer ile geçer", () => expect(() => cronYetkisi(istek("Bearer s3"), "s3")).not.toThrow());
  it("yanlış ya da eksik başlıkta reddeder", () => {
    expect(() => cronYetkisi(istek("Bearer yanlis"), "s3")).toThrow();
    expect(() => cronYetkisi(istek(), "s3")).toThrow();
  });
  it("gizli değer tanımsızsa hiçbir isteği geçirmez ('Bearer undefined' tuzağı)", () => {
    expect(() => cronYetkisi(istek("Bearer undefined"), undefined)).toThrow();
    expect(() => cronYetkisi(istek("Bearer "), "")).toThrow();
  });
});
