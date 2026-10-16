import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { dogrulama, firsat, kaynak, kurum } from "@/db/schema";
import { Bulunamadi, GecersizIstek } from "../errors";
import { api } from "../http";
import { icsOlustur } from "../lib/takvim-ics";

/** GET /api/takvim?id=<firsat> — herkese açık veri; kimlik gerektirmez. Son başvuru gününü .ics olarak verir. */
export const GET = api(async (req) => {
  const id = z.string().uuid().safeParse(new URL(req.url).searchParams.get("id"));
  if (!id.success) throw new GecersizIstek("Geçersiz kimlik");
  const [r] = await db.select({ f: firsat, kurumAdi: kurum.ad }).from(firsat)
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId)).where(eq(firsat.id, id.data));
  if (!r?.f.sonBasvuru) throw new Bulunamadi("Bu program için son başvuru tarihi yok");
  const [d] = await db.select({ url: kaynak.url }).from(dogrulama)
    .innerJoin(kaynak, eq(kaynak.id, dogrulama.kaynakId)).where(eq(dogrulama.varlikId, r.f.id)).limit(1);
  const ics = icsOlustur({ id: r.f.id, baslik: r.f.baslik, kurumAdi: r.kurumAdi, sonBasvuru: r.f.sonBasvuru, kaynakUrl: d?.url });
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="son-basvuru.ics"' } });
});
