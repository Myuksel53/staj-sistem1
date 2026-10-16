/** Hangi adresler oturum ister? Tek yerde tanımlı; `proxy.ts` bunu uygular. Listede olmayan sayfalar herkese açıktır, bilinmeyenler 404'e düşer. */
export const KORUMALI_SAYFALAR = ["/profil", "/firsatlar", "/kaydedilenler", "/laboratuvarlar", "/hocalar", "/basvurular", "/aramalar", "/yonetim"];
/** Oturum istemeyen API uçları. Radar ve cron kendi gizli değeriyle doğrular. Diğer tüm /api/* korumalıdır. */
export const ACIK_API = ["/api/takvim", "/api/radar", "/api/cron"];

const altinda = (yol: string, p: string) => yol === p || yol.startsWith(`${p}/`);

export function apiMi(yol: string): boolean {
  return yol.startsWith("/api/");
}

export function oturumGerekir(yol: string): boolean {
  if (apiMi(yol)) return !ACIK_API.some((p) => altinda(yol, p));
  return KORUMALI_SAYFALAR.some((p) => altinda(yol, p));
}
