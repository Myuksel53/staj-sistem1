import Link from "next/link";

export default function BulunamadiSayfasi() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center text-ink">
      <p className="parilti text-7xl font-bold">404</p>
      <h1 className="text-2xl font-semibold text-ink">Aradığın sayfa bulunamadı</h1>
      <p className="text-ink-mute">Adres yanlış olabilir ya da sayfa taşınmış olabilir.</p>
      <Link href="/" className="rounded-full bg-primary hover:bg-primary-hover px-6 py-2 font-medium text-white">Ana sayfaya dön</Link>
    </main>
  );
}
