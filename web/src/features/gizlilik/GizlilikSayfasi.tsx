
export default function Gizlilik() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-ink">
      <h1 className="mb-2 text-3xl font-bold text-ink">Gizlilik ve veriler</h1>
      <p className="mb-8 text-ink-mute">Kişisel verini en aza indirmeye çalışırız. Neyi sakladığımızı açıkça yazıyoruz.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="cam rounded-2xl p-5">
          <h2 className="mb-2 text-lg font-semibold text-ink">Hesap açarsan sakladıklarımız</h2>
          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
            <li>E-posta adresin ve şifren (şifre yalnızca doğrulama servisinde, özetlenmiş biçimde tutulur).</li>
            <li>Profilde girdiğin bilgiler: bölüm, sınıf, ortalama (isteğe bağlı), ilgi alanları, şehir ve tercihler.</li>
            <li>Eklediğin beceriler ve kanıtları, başvuru takibin, kayıtlı aramaların.</li>
          </ul>
        </section>
        <section className="cam rounded-2xl p-5">
          <h2 className="mb-2 text-lg font-semibold text-ink">Saklamadıklarımız</h2>
          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
            <li><strong>CV’n kaydedilmez.</strong> Yüklediğin dosya ve çıkarılan metin yalnızca analiz süresince bellekte tutulur.</li>
            <li>Giriş yapmadan yaptığın aramalar ve seçimler kullanıcıya bağlanıp kaydedilmez.</li>
            <li>Verilerin üçüncü kişilere satılmaz ya da reklam için kullanılmaz. Eşleştirme yerel modelle yapılır.</li>
          </ul>
        </section>
        <section className="cam rounded-2xl p-5">
          <h2 className="mb-2 text-lg font-semibold text-ink">Verilerini silmek</h2>
          <p className="text-ink-soft">Giriş yaptıktan sonra <a href="/profil" className="underline">Profil</a> sayfasının en altındaki “Hesabımı ve verilerimi sil” ile hesabını ve ona bağlı tüm verilerini kalıcı olarak silebilirsin.</p>
        </section>
        <section className="cam rounded-2xl p-5">
          <h2 className="mb-2 text-lg font-semibold text-ink">Akademisyen bilgileri</h2>
          <p className="text-ink-soft">Akademisyenlerin adı, kurumu ve yayınları herkese açık bir akademik veri kaynağından (OpenAlex) gelir. E-posta adresleri toplanmaz; yalnızca resmî sayfada yayımlanmışsa kullanılmalıdır.</p>
        </section>
      </div>
      <p className="mt-8 text-sm text-ink-mute">Bu metin bilgilendirme amaçlıdır ve proje gösterim aşamasındadır. Gerçek kullanıma açılmadan önce KVKK aydınlatma metni hukuki gözden geçirmeden geçirilmelidir.</p>
    </main>
  );
}
