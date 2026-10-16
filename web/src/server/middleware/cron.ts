import { OturumGerekli } from "../errors";

/** Zamanlayıcı uçları `Authorization: Bearer $CRON_SECRET` ile kendini doğrular. Gizli değer tanımlı değilse hiçbir istek geçmez. */
export function cronYetkisi(req: Request, gizli = process.env.CRON_SECRET): void {
  if (!gizli || req.headers.get("authorization") !== `Bearer ${gizli}`) throw new OturumGerekli("Yetkisiz");
}
