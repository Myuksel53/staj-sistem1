# Çalışmanın Yolu

Bilgisayar ve elektronik mühendisliği öğrencileri için staj ve araştırma fırsatı eşleştirme platformu. İlgi alanına ya da CV'ne uygun programları, laboratuvarları ve akademisyenleri **kaynağı ve son kontrol tarihiyle** birlikte gösterir.

**Temel ilkeler**
- Her bilgi bir kaynak bağlantısına ve kontrol tarihine bağlıdır; doğrulanamayan bilgi "bilinmiyor" olarak gösterilir.
- Kanıtı olmayan beceri uygunluk analizinde "karşılıyor" sayılmaz.
- Sistem kullanıcı adına e-posta göndermez; CV ve yapıştırılan ilan kaydedilmez.
- İlan sitelerinden (Kariyer.net, LinkedIn vb.) veri çekilmez; yalnızca resmî sayfalar ve açık veri (OpenAlex) kullanılır.

## Teknolojiler
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · PostgreSQL (Supabase) + pgvector · Drizzle ORM · Supabase Auth · yerel çok dilli gömme modeli (`multilingual-e5-small`, Transformers.js) · Vitest · Python (OpenAlex içe aktarma)

## Başkasının bilgisayarında çalıştırma

Depoyu indirmek yetmez: **gizli anahtarlar ve veritabanı depoda yoktur** (bilerek). Çalıştırmak isteyen kişi kendi ücretsiz Supabase projesini kurar.

**Gereksinimler:** Node.js **20.9 veya üstü**, bir [Supabase](https://supabase.com) projesi (ücretsiz plan yeterli). Python yalnızca isteğe bağlı veri aktarımı için.

```bash
git clone https://github.com/Myuksel53/staj-sistem1.git
cd staj-sistem1/web
npm ci
cp .env.example .env.local     # aşağıdaki değerleri doldur
npm run db:migrate             # tabloları ve pgvector eklentisini kurar
npm run seed -- ../data/cekirdek.demo.json     # DEMO etiketli örnek veri (gömme modeli ilk seferde ~120 MB iner)
npm run seed -- ../data/cekirdek.gercek.json   # resmî sayfalardan okunmuş gerçek kayıtlar
npm run seed:kutuphane -- ../data/kutuphane.json   # ücretsiz öğrenme kaynakları
npm run dev                    # http://localhost:3000
```

**`.env.local` içinde doldurulacaklar** (Supabase → Project Settings):

| Değişken | Ne için | Zorunlu |
|---|---|---|
| `DATABASE_URL` | Veritabanı bağlantısı (**Transaction pooler**, port 6543) | Evet |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Giriş/kayıt | Evet |
| `SUPABASE_SERVICE_ROLE_KEY` | Hesap silme ve hızlı demo kaydı (yalnızca sunucuda) | Evet |
| `CRON_SECRET` | Kişisel takvim bağlantısını imzalar; rastgele uzun bir değer | Evet |
| `DEMO_HIZLI_KAYIT=1` | Kayıtta e-posta onayı beklemez (yalnızca demo) | İsteğe bağlı |
| `NEXT_PUBLIC_DEMO=1` | Üstte "gösterim sürümü" çubuğu | İsteğe bağlı |
| `ANTHROPIC_API_KEY` | Boşsa kural tabanlı mod çalışır, ücretli servis gerekmez | İsteğe bağlı |
| `OPENALEX_API_KEY` | Akademisyen aktarımında kota artırır | İsteğe bağlı |

**Ne beklemeli:** Anahtarsız açarsan sayfaların iskeleti görünür ama veri bölümleri hata verir; veritabanı kurulmadan ilan, laboratuvar ve giriş çalışmaz. Testler, lint ve derleme anahtarsız da geçer (`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`).

**Akademisyen verisi** (isteğe bağlı, depoda yoktur): `data/` altında Python ortamı kurup (`python -m venv .venv && pip install -r requirements.txt`) `python scripts/tum_iller.py` çalıştırılır. OpenAlex'in ücretsiz günlük kotası sınırlıdır; bitince betik durur ve kaldığı yerden devam eder. Sonra `npm run embed`.

## Belgeler
- `web/ARCHITECTURE.md`: katmanlar ve bağımlılık kuralı
- `web/CONTRACT.md`: API uçları, sayfa erişimi, eylemler
- `ui/DESIGN.md` ve `stitch_ini_kariyer_platformu/`: tasarım sistemi
- `CLAUDE.md`: geliştirici notları
