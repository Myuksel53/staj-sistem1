import { describe, expect, it } from "vitest";
import { icsOlustur, icsTakvim } from "./takvim-ics";

const g = { id: "id-1", baslik: "TÜBİTAK 2209-A; destek, 2026", kurumAdi: "TÜBİTAK", sonBasvuru: "2026-11-11", kaynakUrl: "https://tubitak.gov.tr/x" };
const ics = icsOlustur(g, new Date("2026-10-16T10:00:00Z"));

describe("icsOlustur", () => {
  it("tüm gün olayı üretir, bitiş ertesi gün", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261111");
    expect(ics).toContain("DTEND;VALUE=DATE:20261112");
  });
  it("ay sonunu doğru taşır", () => expect(icsOlustur({ ...g, sonBasvuru: "2026-12-31" })).toContain("DTEND;VALUE=DATE:20270101"));
  it("noktalı virgül ve virgülü kaçırır", () => expect(ics).toContain("SUMMARY:Son başvuru: TÜBİTAK 2209-A\\; destek\\, 2026"));
  it("CRLF ile ayrılır, 3 gün önceden hatırlatır, kaynağı ekler", () => {
    expect(ics.split("\r\n").length).toBeGreaterThan(10);
    expect(ics).toContain("TRIGGER:-P3D");
    expect(ics).toContain("URL:https://tubitak.gov.tr/x");
  });
  it("kaynak yoksa URL satırı koymaz", () => expect(icsOlustur({ ...g, kaynakUrl: null })).not.toContain("URL:"));
});

describe("icsTakvim (abone olunabilir takvim)", () => {
  const f = icsTakvim([g, { ...g, id: "id-2", baslik: "İkinci program", sonBasvuru: "2026-12-01" }], "Çalışmanın Yolu: başvurularım", new Date("2026-10-16T10:00:00Z"));
  it("her program için bir olay üretir", () => expect(f.match(/BEGIN:VEVENT/g)).toHaveLength(2));
  it("her olayda 7 gün ve 1 gün önce hatırlatma vardır", () => {
    expect(f.match(/TRIGGER:-P7D/g)).toHaveLength(2);
    expect(f.match(/TRIGGER:-P1D/g)).toHaveLength(2);
  });
  it("takvim adını ve yenileme ipucunu yazar", () => {
    expect(f).toContain("X-WR-CALNAME:Çalışmanın Yolu: başvurularım");
    expect(f).toContain("REFRESH-INTERVAL;VALUE=DURATION:PT12H");
  });
  it("olaysız takvim geçerli bir boş takvimdir", () => {
    const bos = icsTakvim([], "Boş");
    expect(bos).toContain("BEGIN:VCALENDAR");
    expect(bos).not.toContain("BEGIN:VEVENT");
    expect(bos.endsWith("END:VCALENDAR")).toBe(true);
  });
});
