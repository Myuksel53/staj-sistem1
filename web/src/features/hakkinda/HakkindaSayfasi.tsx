
const ILKELER: [string, string][] = [
  ["Her bilginin kaynağı var", "Bir ilan, laboratuvar ya da akademisyen hakkında gösterilen her bilgi bir kaynak bağlantısına ve kontrol tarihine bağlıdır. Kaynağı olmayan bilgi gösterilmez ya da uyarıyla gösterilir."],
  ["Bilinmeyen, bilinmiyor diye gösterilir", "Bir ilan 30 günden uzun süredir kontrol edilmediyse ya da son başvuru tarihi geçtiyse durumu “bilinmiyor” ya da “kapalı” olur. Bir laboratuvarın öğrenci alıp almadığı bilinmiyorsa uydurmayız."],
  ["Resmî kaynaklar", "Program bilgileri kurumların kendi resmî sayfalarından okunur. LinkedIn, Kariyer.net gibi ilan sitelerinden veri çekilmez. Akademisyenler ve yayınlar açık bir veri kaynağı olan OpenAlex’ten gelir."],
  ["Eşleştirme nasıl yapılıyor", "Önce kesin filtreler (şehir, tür, tarih, durum), sonra ilgi alanın ile ilan ve yayın metinlerinin anlamsal benzerliği, en son sıralama ve açıklama. Eşleştirme yerel bir modelle çalışır."],
  ["E-posta", "Sistem senin adına e-posta göndermez. Taslak hazırlar, sen düzenler ve kendi hesabından gönderirsin. Taslakta yalnızca kanıtını verdiğin becerileri ve doğrulanmış araştırma alanlarını kullanır. Akademisyen e-postası yalnızca resmî sayfada yayımlanmışsa kullanılmalıdır; biz tahmin etmeyiz."],
  ["Yanlış bilgiyi bildir", "Her kartta “Bu bilgi yanlış” bağlantısı vardır. Bildirimler bir kontrol kuyruğuna düşer ve elle doğrulanır."],
];

export default function Hakkinda() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Nasıl çalışıyoruz</h1>
      <p className="mb-8 text-ink-mute">Amaç, öğrencinin doğru fırsatı bulması ve ona güvenebilmesi. Güvenilirlik, özelliklerden önce gelir.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {ILKELER.map(([b, m]) => (
          <section key={b} className="cam rounded-2xl p-5">
            <h2 className="mb-1 text-lg font-semibold text-ink">{b}</h2>
            <p className="text-ink-soft">{m}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Bu bir öğrenci projesidir ve gösterim aşamasındadır. “DEMO” etiketli kayıtlar uydurmadır; gerçek kaynaklı kayıtlar kaynak bağlantısıyla gösterilir.
      </p>
    </main>
  );
}
