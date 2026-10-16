import { CvFormu } from "@/features/cv/CvFormu";


export default function CvSayfasi() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">CV’ne uygun fırsatları bul</h1>
      <p className="mb-4 text-ink-mute">CV’ni yükle; becerilerini çıkaralım, sana uygun staj, araştırma programı, laboratuvar ve akademisyenleri gösterelim. Giriş gerekmez.</p>
      <ul className="cam mb-6 list-disc space-y-1 rounded-2xl p-4 pl-8 text-sm text-ink-soft">
        <li>CV’n <strong>kaydedilmez</strong>: dosya diske yazılmaz, metin veritabanına gitmez, hiçbir dış servise gönderilmez.</li>
        <li>Eşleştirme bu bilgisayardaki yerel modelle yapılır. Sonuç sayfayı kapatınca kaybolur.</li>
        <li>Telefon, e-posta ve bağlantılar eşleştirmeden önce metinden çıkarılır.</li>
      </ul>
      <CvFormu />
    </main>
  );
}
