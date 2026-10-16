# Tasarım sistemi

**Kaynak:** `stitch_ini_kariyer_platformu/DESIGN.md` (ve `screen.png`, `code.html`). Bu klasör tasarım kaynağıdır; kodda uygulanan jetonlar `web/src/styles/tokens.css`, Tailwind adları `web/src/app/globals.css` içindeki `@theme`, ortak parçalar `web/src/components/ui`.

**Çalışmanın Yolu:** İznik çinisinden esinli açık tema. Beyaz porselen kartlar, soğuk gri zemin (`#F8FAFC`), turkuaz ana vurgu (`#087E8B`), kayrak metin (`#1E293B`), Plus Jakarta Sans.

## Renk kuralları (işlevsel, süs değil)

| Jeton | Değer | Yalnızca şunun için |
|---|---|---|
| `primary` / `secondary` | `#087E8B` / `#0E7490` | Ana eylemler, kurumsal staj, navigasyon |
| `mercan` | `#E05A47` | **Zaman-kritik**: son 3 gün, süresi doluyor, eksik şart. Asla süs, genel düğme ya da marka öğesi değil |
| `dogrulama` | `#059669` | Doğrulanmış kaynak, kanıtlı beceri, karşılanan şart |
| `inceleme` | `#D97706` | Bilinmiyor / teyit bekliyor / kanıt bekliyor |
| `akademik` | `#4338CA` | Laboratuvar, akademisyen, araştırma/proje (kurumsal stajdan ayrım) |
| `eslesme` | `#00A896` | Eşleşme halkası ve ilerleme |

Metin ve yüzey: `paper #F8FAFC`, `surface #FFFFFF`, `sand #F1F5F9`, `line #E2E8F0`, `ink #1E293B`, `ink-mute #64748B`.

## Bileşenler

- **Fırsat kartı:** 16 px köşe, 1 px `line` çerçeve, mineral gölge; üzerine gelince turkuaz çerçeve ve hafif yükselme (`.kart`). Üstte kategori rozeti (Kurumsal staj = turkuaz + çanta; Akademik = indigo + bina), son 3 günde mercan "SON N GÜN" bandı, sağ üstte eşleşme halkası, altta doğrulama satırı (`Doğrulandı: 16 Eki` + kaynak alan adı).
- **Rozetler (`Badge`):** hap biçimli, çerçeveli; `dogrulama`, `inceleme`, `mercan`, `akademik`, `kurumsal`. Anlam yalnızca renkle verilmez, ikon ve metin de bulunur.
- **Düğmeler:** 8 px köşe; birincil düz turkuaz, ikincil turkuaz tonlu; `acil` varyantı yalnızca zaman-kritik onaylarda.
- **Üst menü:** logo + "Akademik & Sanayi Doğrulama Portalı", gri zeminli hap biçimli menü, baş harf avatarı. Girişli kullanıcıya ikinci şerit.
- **Profil sayfası** (`features/profil`): üst kart (kanıt oranı), sol sütunda profil kartı (turkuaz bant, GANO, kanıt durumu, tercihler), CV kartı, doğrulama manifestosu; sağda beceri & kanıt kütüphanesi ve uygunluk analizcisi (şart ↔ profil eşleme matrisi).
- **Başvuru takip merkezi:** dört sütun: Başvurulacak (gri), Başvuruldu (turkuaz), Yanıt bekleniyor (kehribar), Görüşme / sonuç (zümrüt).

## İlke: kanıtsız beceri uygun sayılmaz

Beceri kanıtı (proje, sertifika, ders) yoksa uygunluk analizinde şart “Kanıt eksik” olur, “Tam karşılıyor” olmaz ve e-posta taslağına yazılmaz. `server/lib/eligibility.ts` bunu uygular.

## Yaklaşım (2026-10-16 sadeleştirme)

İlk sürümde koyu mor tema, süzülen şekiller, dönen halkalar ve çok renkli gradyanlar vardı; şablon gibi duruyordu. Sonra sadeleştirildi ve Çini açık temaya geçildi. Şimdi:
- **Tek kart dili:** `rounded-xl`, 1px `line` çerçeve, beyaz yüzey, üzerine gelince hafif gölge ve turkuaz çerçeve. Fırsat, laboratuvar ve akademisyen kartları aynı iskeleti kullanır (başlık, kurum, rozetler, alt çizgi altında güven satırı).
- **Süs yok:** zeminde yalnızca çok hafif bir turkuaz ışık.
- **Düz renk:** düğmeler düz turkuaz, gradyan yok. Başlıktaki vurgulu kelime düz turkuaz.
- **Güven satırı tek satır:** "✓ 1 gün önce kontrol edildi · kaynak.alanadi ↗". Uzun cümleler bölüm başlığının altında bir kez yazılır, her karta tekrarlanmaz.
- **DEMO kayıtlar** başlık öneki yerine küçük "DEMO" rozetiyle işaretlenir; üstte ince, sakin bir bilgi çubuğu vardır.
- **Açılış sayfası** boş değildir: güncel gerçek programlar, "nasıl çalışır", güven ilkeleri.
- Anlamsız rozet gösterilmez (ulusal programda "şehir belirtilmemiş" yazmaz).

## Bileşenler (`components/ui`)

`Card` (cam yüzey), `Badge` (hap/kare, ton), `Button` + `dugmeSinifi()` (birincil/ikincil), `ProgressBar` (rol ve değer taşır), `SectionHeader` (şekil + başlık + yan not).

## Hareket ve erişilebilirlik

`yuzer`, `don`, `parilti` animasyonları `prefers-reduced-motion` ile kapanır. Klavye odağı `--odak` çerçevesiyle görünür. Sayfada "İçeriğe geç" bağlantısı vardır. Durum yalnızca renkle verilmez: metin ve simge de bulunur (✓ ✗ ⚠ ?).

## Düzen

Üst menü yapışkan; giriş yapınca ikinci bir şerit üye sayfalarını gösterir. Ana sayfa tek sütun, `max-w-5xl` (başlık, filtre formu, açılış içeriği ya da 3 sütunlu sonuç ızgarası, sayfa numaraları). İç sayfalar `max-w-4xl–6xl`.
