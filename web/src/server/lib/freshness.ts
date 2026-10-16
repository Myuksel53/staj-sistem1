export type FirsatDurumu = "acik" | "kapali" | "bilinmiyor";

const GUN_MS = 24 * 60 * 60 * 1000;
export const BAYAT_GUN = 30;

/** Doğrulama kuralı 2: 30 günden eski kontrol → bilinmiyor; son tarih geçmişse → kapalı. */
export function etkinDurum(
  durum: FirsatDurumu,
  sonKontrol: Date | null,
  sonBasvuru: Date | null,
  simdi = new Date(),
): FirsatDurumu {
  if (sonBasvuru && sonBasvuru.getTime() + GUN_MS <= simdi.getTime()) return "kapali";
  if (!sonKontrol || simdi.getTime() - sonKontrol.getTime() > BAYAT_GUN * GUN_MS) {
    return durum === "kapali" ? "kapali" : "bilinmiyor";
  }
  return durum;
}
