# Staj Asistanı: Ürün Planı

15 Ekim 2026 · meryem

## Özet

Öneri: ilk sürümü tek bir alanda (bilgisayar/elektronik mühendisliği öğrencileri, Türkiye) ve tek bir döngüde kurmak: profil gir, eşleşen staj ilanı ve araştırma grubunu gör, uygunluğunu kontrol et, e-posta taslağı al, başvuruyu takip et.

Ürün, staj ve araştırma fırsatı arayan üniversite öğrencilerine yöneliktir. Rakiplerden farkı iki şeydir: yayımlanmış ilanların yanında ilan vermeyen laboratuvar ve akademisyenleri de bulması, ve her bilgiyi kaynağı ve kontrol tarihiyle göstermesi.

Temel ilke: sistem doğrulayamadığı bir bilgiyi kesin gibi sunmaz. Bu ilke veri modelini, AI çıktılarını ve arayüzü birlikte belirler; bu yüzden her fırsat ve her iddia bir kaynağa bağlanır.

## MVP kapsamı

MVP, 10 özelliğin 6'sını içerir; kalan 4'ü ya iyi veri birikimine ya da sürekli taramaya bağlı olduğu için sonraya kalır. Seçim ölçütü: öğrenciye ilk günden somut fayda sağlaması ve elimizdeki veriyle dürüstçe yapılabilmesi.

| # | Özellik | Faz | Gerekçe |
| --- | --- | --- | --- |
| 1 | Kişiselleştirilmiş eşleştirme ve açıklama | MVP | Ürünün çekirdeği; diğer her özellik bunun üzerine kurulur. |
| 2 | Başvuru uygunluk analizcisi | MVP | İlan metni ve profil yeterli; ek veri gerektirmez, değeri hemen görülür. |
| 9 | Kaynak ve güvenilirlik kontrolü | MVP | Ayrı bir özellik değil, veri modelinin parçası; sonradan eklemek zordur. |
| 6 | Kişiye özel başvuru mesajı | MVP | LLM ile kolay, kullanıcı gönderdiği için riski düşük. |
| 7 | Başvuru takip merkezi | MVP | Basit CRUD; kullanıcının uygulamaya geri dönme sebebi. |
| 3 | İlan yayımlamayan laboratuvarları keşfetme | MVP (dar) | Fark yaratan özellik; başlangıçta birkaç üniversitenin elle doğrulanmış verisiyle. |
| 4 | Araştırma konusundan hoca bulma | Faz 2 | Yayın verisi (OpenAlex) ve anlamsal arama gerektirir; 3'ün verisi oturunca eklenir. |
| 5 | Eksik kapatma yol haritası | Faz 2 | Uygunluk analizinin eksik listesinden türetilir; kaynak kütüphanesi hazırlanmalı. |
| 8 | Alternatif fırsat bulucu | Faz 2 | Yeterli fırsat sayısı olmadan önerecek alternatif yoktur. |
| 10 | Kişisel fırsat radarı | Faz 2 (kayıt), Faz 3 (otomatik tarama) | Kaydedilmiş arama ve e-posta bildirimi kolay; düzenli tarama altyapı ister. |

MVP'nin bittiğini gösterecek ölçüt: 20 gerçek öğrenciden en az yarısının sistemin önerdiği en az bir fırsata başvurması.

## Temel veri modeli

Modelin merkezinde Kaynak ve Doğrulama tabloları durur: fırsatlar, kurumlar ve kişiler hakkındaki her iddia bir kaynağa ve bir kontrol tarihine bağlanır. Böylece 9. özellik (güvenilirlik) arayüzde ek iş olmadan gösterilebilir.

| Varlık | Ana alanlar | Not |
| --- | --- | --- |
| Kullanıcı Profili | bölüm, sınıf, ortalama, ilgi alanları, öğrenmek istenen teknolojiler, şehir, uzaktan/yerinde tercihi, çalışma süresi ve dönemi, dil düzeyi, ücretli/ücretsiz, zorunlu staj mı | Serbest metin + yapılandırılmış alanlar; CV'den otomatik doldurulabilir. |
| Beceri | ad, kategori, düzey (kullanıcı beyanı), kanıt (proje, sertifika, ders) | "Gerçek beceri" e-posta taslağında yalnızca kanıtlı olanlarla kullanılır. |
| Kurum | ad, tür (şirket, üniversite, enstitü), şehir, ülke, web sitesi | Şirketler ve üniversiteler aynı tabloda. |
| Araştırma Grubu | kurum, ad, araştırma konuları, sayfa adresi, öğrenci kabul durumu | Kabul durumu: kabul ediyor / bilinmiyor / kabul etmiyor. |
| Akademisyen | ad, unvan, kurum, grup, konular, resmî profil, ORCID / OpenAlex kimliği | E-posta adresi yalnızca resmî sayfada yayımlanmışsa tutulur. |
| Yayın | başlık, yıl, yazarlar, özet, konu etiketleri, DOI | Hoca bulmada ve e-postada "doğrulanmış çalışma alanı" kanıtı olur. |
| Fırsat | tür (staj, araştırma stajı, proje), kurum, başlık, açıklama, şehir, uzaktan mı, süre, son başvuru tarihi, durum | Durum: açık / kapalı / bilinmiyor; ürün "bilinmiyor"u açıkça gösterir. |
| Şart | fırsat, metin, tür (zorunlu, tercih), normalize edilmiş beceri veya koşul | Uygunluk analizi bu satırları profille karşılaştırır. |
| Kaynak | URL, kaynak türü (resmî sayfa, ilan sitesi, yayın veritabanı), son getirilme tarihi, içerik özeti (hash) | Değişiklik tespiti için hash tutulur. |
| Doğrulama | hangi varlığın hangi alanı, kaynak, değer, kontrol tarihi, yöntem (otomatik, elle), çelişki bayrağı | Aynı alan için iki kaynak farklı değer verirse kullanıcı uyarılır. |
| Eşleşme | kullanıcı, fırsat veya akademisyen, puan, gerekçe, karşılanan ve eksik şartlar, oluşturma tarihi | AI çıktısı saklanır, aynı hesap tekrar yapılmaz. |
| Başvuru | kullanıcı, fırsat, durum, son tarih, notlar, e-posta taslağı | Durum: başvurulacak / başvuruldu / yanıt bekleniyor / görüşme / sonuçlandı. |
| Kayıtlı Arama | kullanıcı, kriterler, son çalışma tarihi, bildirim tercihi | Radarın temeli. |

## Veri kaynakları ve doğrulama

En büyük risk veri: ilan sitelerinin çoğu kazımaya (scraping) izin vermez, akademik veri ise dağınıktır. Bu yüzden MVP, açık API'ler, resmî program sayfaları ve elle doğrulanmış küçük bir çekirdek veriyle başlar.

| Veri | Gerçekçi kaynak | Yöntem | Dikkat |
| --- | --- | --- | --- |
| Staj ilanları | Şirketlerin kendi kariyer sayfaları, üniversite kariyer merkezleri, kullanıcının yapıştırdığı ilan linki | Kariyer sayfası tarama (robots.txt'e uyarak), link yapıştırıp analiz | LinkedIn, Kariyer.net gibi platformların kullanım şartları kazımayı yasaklar; onlardan yalnızca kullanıcının getirdiği link işlenir. |
| Yapılandırılmış programlar | TÜBİTAK BİDEB programları, DAAD RISE, Erasmus+ staj hareketliliği, IAESTE, CERN Summer Student gibi dönemsel programlar | Elle derlenmiş liste + yılda birkaç kez kontrol | Az sayıda, yüksek değerli kayıt; koşulları her dönem değişir. |
| Akademisyen profilleri | YÖK Akademik, üniversite ve bölüm personel sayfaları, ORCID | Resmî sayfadan ad, unvan, konu; ORCID açık API | YÖK Akademik'in toplu erişim izni doğrulanmalı (açık soru). |
| Yayınlar ve konular | OpenAlex (ücretsiz, açık API), Crossref, DergiPark | Yazar ve kurum kimliğiyle yayın çekme, konu etiketleri | Aynı isimli yazarlar karışabilir; kurum eşleştirmesiyle ayırt edilir. |
| Laboratuvar ve gruplar | Bölüm web siteleri, laboratuvar sayfaları | MVP'de 3 ila 5 üniversite için elle + LLM destekli çıkarma | Öğrenci kabulü genelde yazılı değildir; varsayılan "bilinmiyor". |
| Şehir ve yakınlık | Statik il ve mesafe tablosu | Alternatif bulucu için yakın iller listesi | Basit tablo yeterli. |

Bu kurumların adı genel bilgiye dayanıyor; program koşulları ve erişim izinleri veri toplama başlamadan resmî sayfalarından kontrol edilmeli.

**Doğrulama kuralları**

1. Her alan bir Doğrulama kaydı taşır: kaynak URL, kontrol tarihi, yöntem.
2. Bir ilan 30 günden uzun süredir kontrol edilmediyse veya son başvuru tarihi geçtiyse durumu "bilinmiyor" ya da "kapalı" olur.
3. Kaynak sayfa kaybolursa veya içerik hash'i değişirse kayıt yeniden kontrol kuyruğuna girer.
4. İki kaynak aynı alan için farklı değer verirse ikisi de gösterilir ve kullanıcı uyarılır.
5. LLM'in çıkardığı her şart, metinden alıntılanan cümleyle birlikte saklanır; alıntısı olmayan iddia gösterilmez.
6. Kullanıcılar "bu bilgi yanlış" bildirimi yapabilir; bildirim kaydı kontrol kuyruğuna alır.

## AI mimarisi

Eşleştirme tümüyle LLM'e bırakılmaz: kesin koşullar kodla filtrelenir, benzerlik vektör aramasıyla bulunur, LLM yalnızca son sıralamayı ve açıklamayı yapar. Bu hem maliyeti düşürür hem de uydurma (halüsinasyon) riskini sınırlar.

1. **Kesin filtre (kod):** şehir veya uzaktan tercihi, çalışma dönemi, son başvuru tarihi, fırsat durumu.
2. **Anlamsal arama (vektör):** profilin ilgi alanı metni ile fırsat açıklamaları, grup konuları ve yayın özetleri aynı gömme (embedding) uzayında karşılaştırılır; en yakın 30 ila 50 aday alınır.
3. **LLM ile sıralama ve açıklama:** adaylar profille birlikte modele verilir; model puan, kısa gerekçe ve her gerekçe için kaynak alıntısı döndürür (yapılandırılmış JSON çıktı).
4. **Uygunluk analizi:** ilanın şartları bir kez çıkarılıp Şart tablosuna yazılır; her kullanıcı için profille karşılaştırılıp "karşılanıyor / eksik / doğrulanmalı" olarak etiketlenir.
5. **Yol haritası (Faz 2):** eksik şartlar hazır bir kaynak ve mini proje kütüphanesiyle eşleştirilir; LLM yalnızca sıralama ve kişiselleştirme yapar, kaynak linki uydurmaz.
6. **E-posta taslağı:** yalnızca kanıtlı beceriler ve Doğrulama tablosundaki çalışma alanları modele verilir; taslak kullanıcıya düzenlenebilir metin olarak sunulur, sistem e-posta göndermez.

Koruma kuralları: model çıktısındaki her iddia bir kaynağa bağlı değilse arayüze taşınmaz; sıralama ve açıklamalar önbelleğe alınır, profil veya fırsat değişince yenilenir.

## Önerilen teknoloji yığını

Tek kişinin yönetebileceği, az parçalı bir yığın öneriyorum: TypeScript ile Next.js ve Postgres. Vektör arama da Postgres içinde kalır, ayrı bir veritabanı gerekmez.

| Katman | Seçim | Neden |
| --- | --- | --- |
| Web uygulaması | Next.js (React, TypeScript) + Tailwind | Arayüz ve API aynı projede; dağıtımı kolay. |
| Veritabanı | PostgreSQL + pgvector (ör. Supabase) | İlişkisel model + vektör arama tek yerde; Supabase giriş ve dosya depolamayı da verir. |
| ORM | Prisma veya Drizzle | Veri modelini kodda tutar, göçleri (migration) yönetir. |
| LLM | Claude API (sıralama, açıklama, şart çıkarma, e-posta) | Uzun ilan metinleri ve yapılandırılmış çıktı için uygun; Türkçe metinde iyi. |
| Gömme modeli | Çok dilli bir embedding modeli | Türkçe profil ile İngilizce yayın özetlerini aynı uzayda karşılaştırmak için. |
| Veri toplama | Python betikleri (OpenAlex, ORCID istemcileri, sayfa çekme) | Akademik API'lerin Python araçları olgun; zamanlanmış iş olarak çalışır. |
| Zamanlanmış işler | Bir kuyruk/cron servisi (Faz 2'de) | Radar ve yeniden doğrulama için. |
| E-posta bildirimi | Transactional e-posta servisi (Faz 2'de) | Radar bildirimleri; kullanıcı adına e-posta gönderilmez. |

Alternatif: tamamen Python (FastAPI + basit bir ön yüz) daha az JavaScript bilgisi gerektirir; tercihin hangi dili daha iyi bildiğine bağlı.

## Yol haritası ve riskler

Önce dar bir MVP, sonra veriye dayalı özellikler, en son otomasyon.

| Faz | İçerik | Sonraki faza geçiş ölçütü |
| --- | --- | --- |
| Faz 1: MVP | Profil, eşleştirme, açıklama; uygunluk analizi; kaynak ve doğrulama kaydı; e-posta taslağı; başvuru takibi; lab keşfi (3-5 üniversite) | 20 öğrenciden en az 10'u başvurdu |
| Faz 2 | Hoca bulma (OpenAlex); eksik kapatma yol haritası; alternatif fırsat bulucu; kayıtlı arama ve bildirim; daha fazla üniversite | Fırsat verisi elle güncellenemeyecek kadar büyüdü |
| Faz 3 | Otomatik, düzenli tarama; otomatik yeniden doğrulama; kullanıcı hata bildirimleri; yeni alanlar ve ülkeler | — |

Her faza, bir öncekinin geçiş ölçütü karşılanınca geçilir; tarih yerine ölçüt kullanıyorum, çünkü zaman planını henüz belirlemedin.

| Risk | Etkisi | Önlem |
| --- | --- | --- |
| Yeterli ve güncel ilan verisi bulunamaması | Eşleştirme boş veya eski sonuç verir | Dar alanla başla; kullanıcının link yapıştırmasını birinci sınıf özellik yap. |
| Kazıma için yasal ve teknik engeller | Veri toplama durur, hesap engellenir | Açık API ve resmî sayfalar; kullanım şartlarını her kaynak için kaydet. |
| LLM'in şart veya çalışma alanı uydurması | Kullanıcı yanlış bilgiyle başvurur | Alıntısız iddiayı gösterme; e-postada yalnızca doğrulanmış alanlar. |
| Akademisyenlere toplu, kalitesiz e-posta gitmesi | Hocaların tepkisi, ürünün itibarı | Taslak tek tek düzenlenir, sistem göndermez; aynı hocaya sık taslak uyarısı. |
| Kişisel veri (CV, not ortalaması) saklama | KVKK yükümlülükleri | Minimum veri, açık rıza, hesabı ve veriyi silme seçeneği. |
| LLM maliyetinin kullanıcı sayısıyla artması | Bütçe aşılır | Kodla ön filtre, sonuç önbelleği, ilan başına tek seferlik şart çıkarma. |

## Açık sorular

- [ ] Hedef kitle: ilk sürüm yalnızca bilgisayar ve elektronik mühendisliği öğrencileri için mi, yoksa tüm bölümler için mi?
- [ ] Coğrafya: MVP Türkiye ile mi sınırlı, yoksa Avrupa araştırma stajları da ilk günden mi olmalı?
- [ ] Başlangıç verisi: çekirdek liste için hangi 3 ila 5 üniversite ve kaç şirket ele alınsın?
- [ ] YÖK Akademik ve üniversite sayfalarındaki verinin otomatik toplanmasına izin var mı?
- [ ] Bu bir kişisel proje, bitirme projesi mi yoksa ürün mü? Bu, KVKK uyumu ve maliyet hedefini belirler.
- [ ] Hangi programlama dilini daha iyi biliyorsun: TypeScript mi, Python mu?
- [ ] LLM bütçesi: aylık bir üst sınır var mı?
- [ ] Kullanıcılar CV yükleyebilsin mi? (Profil doldurmayı hızlandırır, ama kişisel veri saklamayı artırır.)
