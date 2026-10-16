import { beforeEach, describe, expect, it, vi } from "vitest";
import { OturumGerekli } from "../errors";

const oturum = vi.hoisted(() => ({ acik: false }));
vi.mock("../middleware/rbac", () => ({
  kullaniciId: async () => { if (!oturum.acik) throw new OturumGerekli(); return "kullanici-1"; },
}));
vi.mock("../lib/ai/claude", () => ({ sartlariCikar: async () => [], epostaTaslagi: async () => "taslak" }));
vi.mock("../lib/eslestirme", () => ({ eslestir: async () => { throw new Error("Önce profilde ilgi alanlarını doldur."); } }));
vi.mock("../lib/radar", () => ({ radariCalistir: async () => ({}) }));
vi.mock("../lib/yenidogrulama", () => ({ yenidenDogrula: async () => ({ tamam: true }) }));

const post = (govde: unknown) => new Request("http://x/api", { method: "POST", body: JSON.stringify(govde) });

beforeEach(() => { oturum.acik = false; });

describe("oturum isteyen uçlar", () => {
  it("oturumsuzken 401 verir", async () => {
    const { POST: sartlar } = await import("./sartlar");
    const { POST: eposta } = await import("./eposta");
    const { POST: eslestir } = await import("./eslestir");
    for (const h of [sartlar, eposta, eslestir]) expect((await h(post({}))).status).toBe(401);
  });
  it("sartlar: kısa metni 400, geçerli metni 200 yapar", async () => {
    oturum.acik = true;
    const { POST } = await import("./sartlar");
    expect((await POST(post({ ilanMetni: "kısa" }))).status).toBe(400);
    expect((await POST(post({ ilanMetni: "a".repeat(80) }))).status).toBe(200);
  });
  it("eslestir: profil eksikse 422 ve açıklayıcı mesaj", async () => {
    oturum.acik = true;
    const { POST } = await import("./eslestir");
    const r = await POST(post({}));
    expect(r.status).toBe(422);
    expect((await r.json()).hata).toContain("Önce profilde");
  });
});

describe("zamanlayıcı uçları", () => {
  it("gizli değer olmadan 401", async () => {
    vi.stubEnv("CRON_SECRET", "s3");
    const { GET: radar } = await import("./radar");
    const { GET: dogrula } = await import("./cron-dogrula");
    for (const h of [radar, dogrula]) expect((await h(new Request("http://x"))).status).toBe(401);
    vi.unstubAllEnvs();
  });
  it("doğru gizli değerle cron-dogrula 200", async () => {
    vi.stubEnv("CRON_SECRET", "s3");
    const { GET } = await import("./cron-dogrula");
    expect((await GET(new Request("http://x", { headers: { authorization: "Bearer s3" } }))).status).toBe(200);
    vi.unstubAllEnvs();
  });
});

describe("takvim", () => {
  it("geçersiz kimlikte 400 (veritabanına gitmeden)", async () => {
    const { GET } = await import("./takvim");
    expect((await GET(new Request("http://x/api/takvim?id=abc"))).status).toBe(400);
  });
});

describe("takvim abonelik", () => {
  it("anahtarsız ya da yanlış anahtarla 401 verir (veritabanına gitmeden)", async () => {
    vi.stubEnv("CRON_SECRET", "s3");
    const { GET } = await import("./takvim-abonelik");
    expect((await GET(new Request("http://x/api/takvim/abonelik"))).status).toBe(401);
    expect((await GET(new Request("http://x/api/takvim/abonelik?t=285883ad-cc37-4e9f-871a-7f1dfb3c32f9.sahte"))).status).toBe(401);
    vi.unstubAllEnvs();
  });
});
