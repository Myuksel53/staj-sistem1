import { IlanFormu } from "@/features/ilan-analiz/IlanFormu";


export default function IlanAnalizi() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Bulduğun ilanı analiz et</h1>
      <p className="mb-4 text-ink-mute">Kariyer.net, Youthall, LinkedIn ya da bir şirketin sayfasında gördüğün ilanın metnini yapıştır. Şartlarını çıkarıp senin durumunla karşılaştıralım.</p>
      <ul className="cam mb-6 list-disc space-y-1 rounded-2xl p-4 pl-8 text-sm text-ink-soft">
        <li>Bu sitelerden veri <strong>çekmiyoruz</strong>; kullanım şartları buna izin vermiyor. Metni sen kendin kopyalıyorsun.</li>
        <li>Yapıştırdığın metin kaydedilmez, hiçbir yere gönderilmez.</li>
        <li>İlandaki her şart, yapıştırdığın metinden bir alıntıyla gösterilir.</li>
      </ul>
      <IlanFormu />
    </main>
  );
}
