# Çalışmanın Yolu

Bilgisayar ve elektronik mühendisliği öğrencileri için staj ve araştırma fırsatı eşleştirme platformu. İlgi alanına ya da CV'ne uygun programları, laboratuvarları ve akademisyenleri **kaynağı ve son kontrol tarihiyle** birlikte gösterir.

**Temel ilkeler**
- Her bilgi bir kaynak bağlantısına ve kontrol tarihine bağlıdır; doğrulanamayan bilgi "bilinmiyor" olarak gösterilir.
- Kanıtı olmayan beceri uygunluk analizinde "karşılıyor" sayılmaz.
- Sistem kullanıcı adına e-posta göndermez; CV ve yapıştırılan ilan kaydedilmez.
- İlan sitelerinden (Kariyer.net, LinkedIn vb.) veri çekilmez; yalnızca resmî sayfalar ve açık veri (OpenAlex) kullanılır.

## Teknolojiler
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · PostgreSQL (Supabase) + pgvector · Drizzle ORM · Supabase Auth · yerel çok dilli gömme modeli (`multilingual-e5-small`, Transformers.js) · Vitest · Python (OpenAlex içe aktarma)

## Kurulum
```bash
cd web
cp .env.example .env.local        # Supabase bilgilerini doldur (gizli, yüklenmez)
npm install
npm run db:migrate                # şemayı uygular
npm run seed -- ../data/cekirdek.demo.json     # demo veri (açıkça "DEMO" etiketli)
npm run dev                       # http://localhost:3000
```
Gerçek kaynaklı kayıtlar için `data/cekirdek.gercek.json` dosyası kullanılır. Komutlar: `npm run test`, `typecheck`, `lint`, `build`.

## Belgeler
- `web/ARCHITECTURE.md`: katmanlar ve bağımlılık kuralı
- `web/CONTRACT.md`: API uçları, sayfa erişimi, eylemler
- `ui/DESIGN.md` ve `stitch_ini_kariyer_platformu/`: tasarım sistemi
- `CLAUDE.md`: geliştirici notları
