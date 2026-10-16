import { and, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { basvuru, dogrulama, firsat, kaynak, kurum } from "@/db/schema";
import { OturumGerekli } from "../errors";
import { api } from "../http";
import { icsTakvim, type IcsGirdi } from "../lib/takvim-ics";
import { takvimAnahtariDogrula } from "../lib/takvim-token";

const bugun = () => new Date().toISOString().slice(0, 10);

async function kaynakUrlleri(): Promise<Map<string, string>> {
  const s = await db.select({ id: dogrulama.varlikId, url: kaynak.url }).from(dogrulama)
    .innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId)).where(eq(dogrulama.varlikTuru, "firsat"));
  return new Map(s.map((x) => [x.id, x.url]));
}

const yanit = (ics: string) => new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=0" } });

/** GET /api/takvim/abonelik?t=<anahtar> — kişisel takvim: kullanıcının takip ettiği başvuruların son tarihleri.
 *  Oturum çerezi yerine imzalı anahtar kullanır (takvim uygulamaları çerez göndermez). Yanlış anahtar 401. */
export const GET = api(async (req) => {
  const uid = takvimAnahtariDogrula(new URL(req.url).searchParams.get("t"), process.env.CRON_SECRET);
  if (!uid) throw new OturumGerekli("Geçersiz takvim anahtarı");
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(basvuru)
    .innerJoin(firsat, eq(firsat.id, basvuru.firsatId))
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(eq(basvuru.kullaniciId, uid), isNotNull(firsat.sonBasvuru), gte(firsat.sonBasvuru, bugun())));
  const urller = await kaynakUrlleri();
  const girdiler: IcsGirdi[] = satirlar.map(({ f, kurumAdi }) => ({ id: f.id, baslik: f.baslik, kurumAdi, sonBasvuru: f.sonBasvuru!, kaynakUrl: urller.get(f.id) }));
  return yanit(icsTakvim(girdiler, "Çalışmanın Yolu: başvurularım"));
});

/** GET /api/takvim/tum — herkese açık: gerçek (DEMO olmayan) programların yaklaşan tüm son başvuru tarihleri. */
export const TUM = api(async () => {
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(firsat).innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(isNotNull(firsat.sonBasvuru), gte(firsat.sonBasvuru, bugun())));
  const urller = await kaynakUrlleri();
  const girdiler = satirlar.filter(({ f }) => !f.baslik.startsWith("DEMO"))
    .map(({ f, kurumAdi }): IcsGirdi => ({ id: f.id, baslik: f.baslik, kurumAdi, sonBasvuru: f.sonBasvuru!, kaynakUrl: urller.get(f.id) }));
  return yanit(icsTakvim(girdiler, "Çalışmanın Yolu: son başvuru tarihleri"));
});
