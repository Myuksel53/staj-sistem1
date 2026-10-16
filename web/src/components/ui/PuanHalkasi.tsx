/** Eşleşme rozeti: dairesel ilerleme halkası + yüzde. Renk: yüksek = eşleşme yeşil-mavisi, orta = turkuaz, düşük = nötr gri. */
export function PuanHalkasi({ puan, etiket = "Eşleşme" }: { puan: number; etiket?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(puan)));
  const r = 11, c = 2 * Math.PI * r;
  const renk = p >= 75 ? "var(--eslesme)" : p >= 55 ? "var(--primary)" : "var(--ink-faint)";
  return (
    <span role="img" aria-label={`%${p} ${etiket}`} className="inline-flex items-center gap-1.5 rounded-full border border-primary-line bg-primary-tint py-0.5 pl-1 pr-2.5 text-xs font-bold text-primary-ink">
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden>
        <circle cx="14" cy="14" r={r} fill="none" stroke="var(--primary-line)" strokeWidth="3" />
        <circle cx="14" cy="14" r={r} fill="none" stroke={renk} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} transform="rotate(-90 14 14)" />
      </svg>
      %{p} {etiket}
    </span>
  );
}
