const TEMEL = "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:opacity-60";
const VARYANT = {
  birincil: "bg-primary px-5 py-2.5 text-sm text-white hover:bg-secondary",
  ikincil: "border border-primary-line bg-primary-tint px-4 py-2 text-sm text-primary hover:bg-sky-50",
  // Yalnızca son başvuru onayı gibi zaman-kritik eylemlerde (tasarım sistemi kuralı).
  acil: "border border-mercan bg-surface px-4 py-2 text-sm text-mercan-ink hover:bg-mercan-tint",
} as const;

export type DugmeVaryanti = keyof typeof VARYANT;

/** Bağlantıyı da düğme gibi göstermek için sınıf üretir: <a className={dugmeSinifi("ikincil")}>. */
export const dugmeSinifi = (varyant: DugmeVaryanti = "birincil") => `${TEMEL} ${VARYANT[varyant]}`;

export function Button({ varyant = "birincil", className = "", ...kalan }: React.ComponentPropsWithoutRef<"button"> & { varyant?: DugmeVaryanti }) {
  return <button className={`${dugmeSinifi(varyant)} ${className}`} {...kalan} />;
}
