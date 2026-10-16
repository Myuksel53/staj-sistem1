"use client";
import Link from "next/link";

export default function Hata({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center text-ink">
      <h1 className="text-2xl font-semibold text-ink">Bir şeyler ters gitti</h1>
      <p className="text-ink-mute">İşlem tamamlanamadı. Bir kez daha dene; sorun sürerse biraz sonra tekrar gel.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-full bg-primary hover:bg-primary-hover px-6 py-2 font-medium text-white">Tekrar dene</button>
        <Link href="/" className="rounded-full border border-line px-6 py-2 text-ink-soft">Ana sayfa</Link>
      </div>
    </main>
  );
}
