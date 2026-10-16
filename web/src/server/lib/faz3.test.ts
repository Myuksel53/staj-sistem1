import { describe, expect, it } from "vitest";
import { robotsIzinVerir } from "./robots";
import { icerikHash, metneIndirge } from "./icerik";
import { sonucBelirle } from "./yenidogrulama";
import { adminMi } from "../middleware/rbac";
import { kesinFiltre } from "./filters";

const UA = "CalismaninYoluBot/1.0";

describe("robotsIzinVerir", () => {
  const txt = "User-agent: *\nDisallow: /private/\nAllow: /private/acik\n\nUser-agent: CalismaninYoluBot\nDisallow: /yasak";
  it("özel grup varsa onu kullanır", () => {
    expect(robotsIzinVerir(txt, "/yasak/x", UA)).toBe(false);
    expect(robotsIzinVerir(txt, "/private/x", UA)).toBe(true); // * grubu uygulanmaz
  });
  it("genel grupta en uzun eşleşme kazanır", () => {
    expect(robotsIzinVerir(txt, "/private/x", "Baska")).toBe(false);
    expect(robotsIzinVerir(txt, "/private/acik", "Baska")).toBe(true);
  });
  it("boş Disallow ve kural yokluğu izindir", () => {
    expect(robotsIzinVerir("User-agent: *\nDisallow:", "/a", UA)).toBe(true);
    expect(robotsIzinVerir("", "/a", UA)).toBe(true);
  });
  it("tümünü engelleyen kuralı uygular", () => expect(robotsIzinVerir("User-agent: *\nDisallow: /", "/a", UA)).toBe(false));
  it("joker ve $ destekler", () => {
    expect(robotsIzinVerir("User-agent: *\nDisallow: /*.pdf$", "/a/b.pdf", UA)).toBe(false);
    expect(robotsIzinVerir("User-agent: *\nDisallow: /*.pdf$", "/a/b.pdf.html", UA)).toBe(true);
  });
});

describe("içerik hash'i", () => {
  it("script, etiket ve boşluk farkından etkilenmez", () => {
    const a = "<html><script>x=1</script><p>Son   Başvuru: 1 Mart</p></html>";
    const b = "<html><script>x=2</script><p>son başvuru: 1 mart</p>\n</html>";
    expect(icerikHash(a)).toBe(icerikHash(b));
  });
  it("metin değişince hash değişir", () =>
    expect(icerikHash("<p>Açık</p>")).not.toBe(icerikHash("<p>Kapalı</p>")));
  it("metneIndirge etiketleri atar", () => expect(metneIndirge("<b>Merhaba</b> <!-- x -->dünya")).toBe("merhaba dünya"));
});

describe("sonucBelirle", () => {
  it("404 kayıp", () => expect(sonucBelirle(404, "a", null)).toBe("kayip"));
  it("5xx hata", () => expect(sonucBelirle(503, "a", null)).toBe("hata"));
  it("ilk getirme", () => expect(sonucBelirle(200, null, "h")).toBe("ilk"));
  it("aynı", () => expect(sonucBelirle(200, "h", "h")).toBe("ayni"));
  it("değişti", () => expect(sonucBelirle(200, "h", "g")).toBe("degisti"));
});

describe("adminMi", () => {
  it("büyük/küçük harfe bakmaz", () => expect(adminMi("A@B.com", "x@y.com, a@b.com")).toBe(true));
  it("liste boşsa kimse admin değil", () => expect(adminMi("a@b.com", "")).toBe(false));
  it("eposta yoksa değil", () => expect(adminMi(undefined, "a@b.com")).toBe(false));
});

describe("ülke filtresi", () => {
  const f = { sehir: null, uzaktan: null, durum: "acik" as const, sonKontrol: new Date(), sonBasvuru: null, ulke: "DE" };
  it("tercih dışı ülke elenir", () => expect(kesinFiltre(f, { ulkeler: ["TR"] })).toBe(false));
  it("tercih edilen ülke kalır", () => expect(kesinFiltre(f, { ulkeler: ["tr", "de"] })).toBe(true));
  it("tercih yoksa fark etmez", () => expect(kesinFiltre(f, { ulkeler: [] })).toBe(true));
});
