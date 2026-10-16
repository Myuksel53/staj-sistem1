const GUN_MS = 86_400_000;

/** Son başvuruya kalan tam gün (bugün = 0). Geçmişse negatif, tarih yoksa null. Saat dilimi farkı çıkmasın diye yerel takvim günü esas. */
export function kalanGun(sonBasvuru: string | null | undefined, simdi = new Date()): number | null {
  if (!sonBasvuru) return null;
  const [y, a, g] = sonBasvuru.split("-").map(Number);
  if (!y || !a || !g) return null;
  const hedef = Date.UTC(y, a - 1, g);
  const bugun = Date.UTC(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
  return Math.round((hedef - bugun) / GUN_MS);
}

export type Aciliyet = "gecti" | "acil" | "yakin" | "rahat";

export function aciliyet(kalan: number): Aciliyet {
  if (kalan < 0) return "gecti";
  if (kalan <= 7) return "acil";
  if (kalan <= 30) return "yakin";
  return "rahat";
}

export function kalanMetni(kalan: number): string {
  if (kalan < 0) return "süresi geçti";
  if (kalan === 0) return "son gün bugün";
  return `${kalan} gün kaldı`;
}
