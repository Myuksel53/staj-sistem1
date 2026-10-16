import { z } from "zod";
import { api, govde } from "../http";
import { sartlariCikar } from "../lib/ai/claude";
import { kullaniciId } from "../middleware/rbac";

const Girdi = z.object({ ilanMetni: z.string().min(50).max(30000) });

/** POST /api/sartlar — ilan metninden alıntılı şartları çıkarır (oturum gerekir). */
export const POST = api(async (req) => {
  await kullaniciId();
  const { ilanMetni } = await govde(req, Girdi);
  return Response.json({ sartlar: await sartlariCikar(ilanMetni) });
});
