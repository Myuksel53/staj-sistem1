

const BOLUMLER: { baslik: string; maddeler: string[] }[] = [
  {
    baslik: "Başvurmadan önce kontrol listesi",
    maddeler: [
      "Staj zorunlu mu, isteğe bağlı mı? Bazı programlar (ör. TUSAŞ SKY) yalnızca müfredatında zorunlu stajı olan öğrencileri kabul eder.",
      "Sınıf ve not ortalaması şartını ilanda oku; sağlamıyorsan vakit kaybetme, benzer ilana geç.",
      "Staj onay belgeleri ve sigorta işlemleri okulun staj komisyonunun yönergesine bağlıdır. Başvurmadan önce komisyona sor.",
      "Son başvuru tarihini resmî sayfadan doğrula. Bu sitedeki tarihler kaynak sayfadan okunmuştur ve değişebilir.",
    ],
  },
  {
    baslik: "Staj için e-posta nasıl yazılır",
    maddeler: [
      "Konu satırı net olsun: “Yaz stajı başvurusu – [Ad Soyad], [Bölüm], [Sınıf]”.",
      "İlk iki cümlede kim olduğunu ve neden o kurumu seçtiğini yaz. Kuruma özgü bir şeye (bir ürün, bir proje) değin.",
      "Yalnızca kanıtlayabildiğin becerileri yaz ve her biri için tek bir somut kanıt ver: proje bağlantısı, ders, sertifika.",
      "Özgeçmişi ek olarak ekle (PDF, tek sayfa). Hangi dönem ve kaç hafta çalışabileceğini belirt.",
      "Cevap gelmezse 7–10 gün sonra tek bir kısa hatırlatma gönder; fazlası ters etki yapar.",
    ],
  },
  {
    baslik: "Araştırma stajı için hocaya yazarken",
    maddeler: [
      "Hocanın son yayınlarından birini oku ve e-postada adını anarak neyi ilginç bulduğunu bir cümleyle yaz.",
      "Ne yapabileceğini söyle (ör. veri toplama, deney tekrarı, kod yazma) ve ne kadar süre ayırabileceğini belirt.",
      "Aynı metni onlarca hocaya toplu gönderme. Hoca şablon olduğunu hemen anlar.",
      "Öğrenci kabul edip etmediği çoğu zaman bilinmez; yanıt gelmemesi kişisel bir ret değildir.",
      "E-posta adresini yalnızca üniversitenin resmî sayfasında yayımlanmışsa kullan.",
    ],
  },
  {
    baslik: "Özgeçmiş ve portföy",
    maddeler: [
      "Tek sayfa, ters kronolojik. Önce projeler ve dersler, sonra beceriler.",
      "GitHub’da en az bir düzenli README’li proje bulundur; bağlantıyı özgeçmişe koy.",
      "Not ortalamasını ilan istiyorsa yaz; istemiyorsa ve düşükse öne çıkarma.",
    ],
  },
  {
    baslik: "Dolandırıcılığa karşı",
    maddeler: [
      "Staj ya da iş için senden ücret isteyen ilanlara başvurma.",
      "Başvuru bağlantısının kurumun kendi alan adında olduğunu kontrol et; yönlendirmeli kısaltılmış bağlantılara dikkat et.",
      "Bu sitede her kaydın altında kaynak bağlantısı vardır. Kaynağı olmayan bilgiye güvenme ve “Bu bilgi yanlış” ile bize bildir.",
    ],
  },
];

export default function Rehber() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Başvuru rehberi</h1>
      <p className="mb-8 text-ink-mute">Genel öneriler. Her kurumun ve okulun kuralı farklı olabilir; resmî duyuruları esas al.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {BOLUMLER.map((b) => (
          <section key={b.baslik} className="cam rounded-2xl p-6">
            <h2 className="mb-3 text-xl font-semibold text-ink">{b.baslik}</h2>
            <ul className="list-disc space-y-2 pl-5 text-ink-soft">
              {b.maddeler.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </section>
        ))}
      </div>
      <p className="cam mt-8 rounded-2xl p-5 text-sm text-ink-soft">
        Sistem senin adına hiçbir zaman e-posta göndermez. Taslağı sen düzenler ve kendi hesabından gönderirsin.
        Giriş yaptıktan sonra <a href="/basvurular" className="underline">Başvurular</a> sayfasında taslak hazırlayabilirsin.
      </p>
    </main>
  );
}
