import { eq } from "drizzle-orm";
import { ProgressBar } from "@/components/ui";
import { db } from "@/db";
import { beceri, kullaniciProfili } from "@/db/schema";
import { profilTamamlama } from "@/server/lib/profil-tamamlama";
import { kullaniciId } from "@/server/middleware/rbac";

/** Profil tamamlama kartı. `kompakt`: yalnızca eksik varsa tek satırlık hatırlatma (Fırsatlarım sayfası için). */
export async function ProfilDurumu({ kompakt = false }: { kompakt?: boolean }) {
  const uid = await kullaniciId();
  const [p] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, uid));
  const bec = await db.select().from(beceri).where(eq(beceri.kullaniciId, uid));
  const t = profilTamamlama(p, bec);
  if (kompakt) {
    if (t.eksikler.length === 0) return null;
    return (
      <p className="mb-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        Profilin <strong className="text-ink">%{t.yuzde}</strong> hazır. Daha isabetli sonuç için <a href="/profil" className="font-medium text-primary-ink underline">{t.eksikler[0].ad.toLocaleLowerCase("tr-TR")} bilgisini tamamla</a>.
      </p>
    );
  }
  return (
    <section aria-label="Profil tamamlama" className="mb-8 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">Profilin %{t.yuzde} hazır</span>
        <span className="text-ink-mute">{t.eksikler.length === 0 ? "Her şey tamam" : `${t.eksikler.length} madde eksik`}</span>
      </div>
      <div className="mt-2"><ProgressBar deger={t.yuzde} ton={t.yuzde >= 80 ? "yesil" : "mavi"} etiket="Profil tamamlama" /></div>
      {t.eksikler.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {t.eksikler.map((m) => (
            <li key={m.anahtar} className="flex gap-2">
              <span aria-hidden className="mt-0.5 text-coral-ink">○</span>
              <span><strong className="text-ink">{m.ad}</strong> <span className="text-ink-mute">· {m.neden}</span></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-mute">Eşleştirme ve e-posta taslağı için gereken her şey var. Fırsatlarım sayfasından “Eşleştir”e basabilirsin.</p>
      )}
    </section>
  );
}
