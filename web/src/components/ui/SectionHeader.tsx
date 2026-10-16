const AYRAC = {
  elmas: "bg-primary", // fırsatlar: turkuaz
  daire: "bg-akademik", // laboratuvarlar: akademik indigo
  ucgen: "bg-secondary", // akademisyenler: derin deniz
} as const;

/** Bölüm başlığı: küçük renkli dikey çizgi + başlık + soluk yan not (ör. sonuç sayısı). Mercan burada kullanılmaz (yalnızca aciliyet içindir). */
export function SectionHeader({ ayrac, children, not }: { ayrac: keyof typeof AYRAC; children: React.ReactNode; not?: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
      <span aria-hidden className={`h-6 w-1.5 rounded-full ${AYRAC[ayrac]}`} />
      <span>{children}</span>
      {not && <span className="text-sm font-medium text-ink-mute">{not}</span>}
    </h2>
  );
}
