import { api } from "../http";
import { radariCalistir } from "../lib/radar";
import { supabaseYonetici } from "../lib/supabase/admin";
import { cronYetkisi } from "../middleware/cron";

/** GET /api/radar — zamanlayıcı çağırır (Bearer CRON_SECRET). Bildirimi açık kayıtlı aramaları çalıştırıp yeni ilanları e-postalar. */
export const GET = api(async (req) => {
  cronYetkisi(req);
  const yonetici = supabaseYonetici();
  const sonuc = await radariCalistir(async (uid) => (await yonetici.auth.admin.getUserById(uid)).data.user?.email ?? null);
  return Response.json(sonuc);
});
