const RENK = { yesil: "bg-eslesme", mavi: "bg-primary", sari: "bg-inceleme", mercan: "bg-mercan" } as const;

/** 0-100 arası dolu çubuk. Erişilebilirlik için progressbar rolü ve değerleri taşır. */
export function ProgressBar({ deger, ton = "mavi", etiket }: { deger: number; ton?: keyof typeof RENK; etiket: string }) {
  const yuzde = Math.max(0, Math.min(100, deger));
  return (
    <div role="progressbar" aria-label={etiket} aria-valuenow={yuzde} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-sand">
      <div className={`h-full rounded-full ${RENK[ton]}`} style={{ width: `${yuzde}%` }} />
    </div>
  );
}
