import { headers } from "next/headers";
import { kullaniciId } from "@/server/middleware/rbac";
import { takvimAnahtariUret } from "@/server/lib/takvim-token";

/** Kişisel, abone olunabilir takvim bağlantısı. Takvim uygulaması 7 gün ve 1 gün önce kendisi hatırlatır; e-posta servisi gerekmez, ücretsizdir. */
export async function TakvimAbonelik() {
  const uid = await kullaniciId();
  const anahtar = takvimAnahtariUret(uid, process.env.CRON_SECRET);
  if (!anahtar) return null;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const yol = `/api/takvim/abonelik?t=${anahtar}`;
  const yerel = host.startsWith("localhost") || host.startsWith("127.");
  return (
    <section aria-label="Takvim aboneliği" className="mb-8 rounded-xl border border-line bg-surface p-5">
      <h2 className="font-semibold text-ink">Son tarihleri takvimine ekle, hatırlatmayı takvimin yapsın</h2>
      <p className="mt-1 text-sm text-ink-mute">
        Takip ettiğin başvuruların son tarihleri Google, Apple veya Outlook Takvim’e düşer ve <strong className="text-ink">7 gün ile 1 gün önce</strong> hatırlatılır. Yeni takip ettiklerin kendiliğinden eklenir. Ücretsizdir, e-posta gerekmez.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a href={`webcal://${host}${yol}`} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover">Takvimime abone ol</a>
        <input readOnly aria-label="Takvim adresi" value={`${proto}://${host}${yol}`} className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink-mute" />
      </div>
      <p className="mt-2 text-xs text-ink-mute">Google Takvim’de: “Diğer takvimler → URL’den ekle”ye yukarıdaki adresi yapıştır. Bu adres sana özeldir, başkasıyla paylaşma.</p>
      {yerel && <p className="mt-1 text-xs text-amber-800">Şu an yerel sunucuda çalışıyorsun; bu adres yalnızca bu bilgisayarda açılır. Site yayına alınınca gerçek adresinle çalışır.</p>}
    </section>
  );
}
