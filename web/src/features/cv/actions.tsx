"use server";
import { Badge } from "@/components/ui";
import { db } from "@/db";
import { kaynakKutuphanesi } from "@/db/schema";
import { KesifSonuc } from "@/features/kesif/KesifSonuc";
import { GelisimOnerileri } from "./Gelisim";
import { cvBecerileri, cvTemizle } from "@/server/lib/cv";
import { cvMetni } from "@/server/lib/cv-oku";
import { alanKonulari, cvGozlemleri, eksikBeceriOnerileri } from "@/server/lib/cv-oneri";
import { uyumHesapla } from "@/server/lib/cv-uyum";
import { konularTespit } from "@/server/lib/konu";
import { kesif } from "@/server/lib/kesif";
import { kayitliKume } from "@/server/lib/kayitli";
import { kullaniciIdOpsiyonel } from "@/server/middleware/rbac";

export type CvDurum = { hata?: string; sonuc?: React.ReactNode } | null;

/** CV'yi yalnızca bellekte işler: metin çıkar, beceri bul, yerel modelle eşleştir. Hiçbir şey kaydedilmez, loglanmaz, dışarı gönderilmez. */
export async function cvAnaliz(_onceki: CvDurum, fd: FormData): Promise<CvDurum> {
  if (fd.get("onay") !== "1") return { hata: "Devam etmek için CV’nin bu analiz için işlenmesini onaylaman gerekir." };
  const dosya = fd.get("cv");
  const yapistirilan = String(fd.get("metin") ?? "");
  let ham = yapistirilan;
  try {
    if (dosya instanceof File && dosya.size > 0) ham = await cvMetni(dosya);
  } catch (e) {
    return { hata: e instanceof Error ? e.message : "Dosya okunamadı." };
  }
  if (ham.trim().length < 80) {
    return { hata: "CV’den yeterli metin çıkmadı. Taranmış (görüntü) PDF olabilir; metni yapıştırmayı dene." };
  }
  const beceriler = cvBecerileri(ham);
  const ozet = cvTemizle(ham, 500);
  const s = await kesif(beceriler.slice(0, 15), ozet, "", { tur: "", sadeceAcik: false, demoGizle: fd.get("gercek") === "1", tumu: true });
  if (!s) return { hata: "Analiz için yeterli içerik bulunamadı." };
  // Güncel (kapanmamış, süresi geçmemiş) ilanları uyum puanıyla yeniden sırala.
  const uyumlar = uyumHesapla(beceriler, s.ilanlar);
  const kayitli = await kayitliKume(await kullaniciIdOpsiyonel());
  s.ilanlar.sort((a, b) => (uyumlar.get(b.id)?.puan ?? 0) - (uyumlar.get(a.id)?.puan ?? 0));

  // Gelişim önerileri: en uyumlu 10 ilandan istenen ama CV'de olmayan beceriler, alandaki laboratuvar konuları, CV gözlemleri.
  const enUyumlu = s.ilanlar.slice(0, 10);
  const oneriler = {
    alanlar: konularTespit(`${ham} ${beceriler.join(" ")}`).slice(0, 4),
    eksikler: eksikBeceriOnerileri(beceriler, enUyumlu, await db.select().from(kaynakKutuphanesi)),
    konular: alanKonulari(s.gruplar),
    gozlemler: cvGozlemleri(ham, beceriler.length),
    ilanSayisi: enUyumlu.length + s.gruplar.length,
    demoDahil: enUyumlu.some((i) => i.baslik.startsWith("DEMO")),
  };

  return {
    sonuc: (
      <div className="flex flex-col gap-8">
        <section className="kart p-5">
          <h2 className="mb-3 text-lg font-bold tracking-tight text-ink">CV’nde bulduğumuz beceriler</h2>
          {beceriler.length > 0 ? (
            <div className="flex flex-wrap gap-2">{beceriler.map((b) => <Badge key={b} ton="kurumsal">{b}</Badge>)}</div>
          ) : (
            <p className="text-sm text-inceleme-ink">Bilinen bir beceri adı yakalanmadı. Eşleştirme yine de CV’nin genel içeriğine göre yapıldı.</p>
          )}
          <p className="mt-3 text-xs text-ink-mute">Bu liste yalnızca CV’de geçen sözcüklerden çıkarıldı; seviyeni ya da kanıtını bilmiyoruz. Eksik ya da yanlış varsa sorun değil, eşleştirme aşağıdaki sonuçlarla yapıldı.</p>
        </section>
        <GelisimOnerileri {...oneriler} />
        <KesifSonuc s={s} uyumlar={uyumlar} kayitli={kayitli} altNot={
          <div className="kart p-5 text-center text-sm text-ink-soft">
            CV’n ve çıkarılan metin kaydedilmedi. Becerilerini profiline eklemek ve uygunluk kontrolü yapmak için{" "}
            <a href="/giris" className="font-semibold text-primary underline underline-offset-4">giriş yap</a>.
          </div>
        } />
      </div>
    ),
  };
}
