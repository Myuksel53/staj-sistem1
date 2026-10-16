import { api } from "../http";
import { yenidenDogrula } from "../lib/yenidogrulama";
import { cronYetkisi } from "../middleware/cron";

/** GET /api/cron/dogrula — zamanlayıcı çağırır (Bearer CRON_SECRET). Resmî sayfaları robots.txt'e uyarak yeniden okur. */
export const GET = api(async (req) => {
  cronYetkisi(req);
  return Response.json(await yenidenDogrula());
});
