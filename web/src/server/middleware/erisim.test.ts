import { describe, expect, it } from "vitest";
import { oturumGerekir } from "./erisim";

describe("oturumGerekir", () => {
  it("üye sayfaları oturum ister", () => {
    for (const y of ["/profil", "/firsatlar", "/kaydedilenler", "/laboratuvarlar", "/hocalar", "/basvurular", "/aramalar", "/yonetim", "/profil/ayar"]) expect(oturumGerekir(y)).toBe(true);
  });
  it("herkese açık sayfalar istemez", () => {
    for (const y of ["/", "/giris", "/cv", "/ilan-analiz", "/takvim", "/kaynaklar", "/rehber", "/hakkinda", "/gizlilik", "/firsat/abc", "/yok-boyle-sayfa"]) expect(oturumGerekir(y)).toBe(false);
  });
  it("açık API uçları istemez, diğer tüm /api/* ister", () => {
    for (const y of ["/api/takvim", "/api/radar", "/api/cron/dogrula"]) expect(oturumGerekir(y)).toBe(false);
    for (const y of ["/api/eslestir", "/api/sartlar", "/api/eposta", "/api/yeni-bir-sey"]) expect(oturumGerekir(y)).toBe(true);
  });
  it("önek tuzağına düşmez (/profilim açık, /profil/ ister)", () => {
    expect(oturumGerekir("/profilim")).toBe(false);
    expect(oturumGerekir("/api/takvimx")).toBe(true);
  });
});
