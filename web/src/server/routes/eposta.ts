import { z } from "zod";
import { IslenemezIstek } from "../errors";
import { api, govde } from "../http";
import { epostaTaslagi } from "../lib/ai/claude";
import { kullaniciId } from "../middleware/rbac";

const Girdi = z.object({
  kullaniciAdi: z.string().min(1),
  hedefAdi: z.string().min(1),
  hedefTuru: z.enum(["akademisyen", "sirket"]),
  kanitliBeceriler: z.array(z.object({ ad: z.string(), kanit: z.string().min(1) })),
  dogrulanmisCalismaAlanlari: z.array(z.string()),
});

/** POST /api/eposta — taslak üretir; GÖNDERMEZ. Doğrulanmış araştırma alanı yoksa taslak reddedilir (422). */
export const POST = api(async (req) => {
  await kullaniciId();
  const girdi = await govde(req, Girdi);
  const taslak = await epostaTaslagi(girdi).catch((e: Error) => { throw new IslenemezIstek(e.message); });
  return Response.json({ taslak });
});
