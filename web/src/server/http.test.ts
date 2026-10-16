import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Bulunamadi, GecersizIstek, IslenemezIstek, OturumGerekli, Yasak } from "./errors";
import { api, govde } from "./http";

const istek = (govdeMetni?: string) => new Request("http://x/api", { method: "POST", body: govdeMetni });

describe("api()", () => {
  it("bilinen hataları kendi durum koduna çevirir", async () => {
    for (const [hata, durum] of [[new GecersizIstek(), 400], [new OturumGerekli(), 401], [new Yasak(), 403], [new Bulunamadi(), 404], [new IslenemezIstek("x"), 422]] as const) {
      const r = await api(async () => { throw hata; })(istek());
      expect(r.status).toBe(durum);
      expect((await r.json()).hata).toBe(hata.message);
    }
  });
  it("bilinmeyen hatada ayrıntı sızdırmaz ve 500 döner", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await api(async () => { throw new Error("postgres://gizli-parola@host"); })(istek());
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toContain("gizli-parola");
  });
  it("Next.js akış kontrol hatalarını (digest taşıyanlar) yutmaz", async () => {
    const nextHatasi = Object.assign(new Error("dinamik"), { digest: "DYNAMIC_SERVER_USAGE" });
    await expect(api(async () => { throw nextHatasi; })(istek())).rejects.toBe(nextHatasi);
  });
  it("başarılı yanıtı olduğu gibi geçirir", async () => {
    const r = await api(async () => Response.json({ tamam: true }))(istek());
    expect(await r.json()).toEqual({ tamam: true });
  });
});

describe("govde()", () => {
  const sema = z.object({ ad: z.string().min(2) });
  it("geçerli gövdeyi döndürür", async () => expect(await govde(istek('{"ad":"Ayşe"}'), sema)).toEqual({ ad: "Ayşe" }));
  it("bozuk JSON'u 400 yapar", async () => { await expect(govde(istek("{bozuk"), sema)).rejects.toBeInstanceOf(GecersizIstek); });
  it("şemaya uymayanı 400 yapar", async () => { await expect(govde(istek('{"ad":"A"}'), sema)).rejects.toBeInstanceOf(GecersizIstek); });
});
