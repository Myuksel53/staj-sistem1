# Mimari

Çalışmanın Yolu tek bir Next.js 16 uygulamasıdır (App Router, `cacheComponents` açık), ama kod **katmanlara** ayrılmıştır. Katmanlar bir ayrı sunucu + ayrı arayüz yapısındaki gibi davranır: arayüz sunucu mantığını yalnızca tanımlı kapılardan çağırır, sunucu mantığı arayüzü hiç bilmez.

```
web/src
├── app/            Yalnızca Next yönlendirme kabuğu. Sayfa dosyaları ince: features'taki bileşeni + metadata'yı verir.
│   └── api/*/route.ts   Tek satır: server/routes'taki işleyiciyi dışa aktarır.
├── features/       Özellik başına arayüz (Server Component sayfalar, formlar, Server Action'lar).
│   └── <özellik>/  <Ad>Sayfasi.tsx, actions.ts(x), özelliğe özel bileşenler
├── layout/         Her sayfada görünen kabuk: UstMenu, AltBilgi, NavLink
├── components/ui/  Alan bilgisi taşımayan ortak parçalar: Card, Badge, Button, ProgressBar, SectionHeader
├── styles/         tokens.css (renk/gradyan jetonları), efektler.css (hareket, cam), uyarlama.css (eski sınıfları temaya bağlar)
├── server/         Sunucu tarafı. Arayüzü bilmez.
│   ├── routes/     API işleyicileri (Request → Response), `api()` ile sarılı, testleri yanında
│   ├── middleware/ rbac.ts (oturum, yönetici), cron.ts (Bearer CRON_SECRET), erisim.ts (hangi adres oturum ister)
│   ├── lib/        Alan mantığı: eşleştirme, filtreler, tazelik, uygunluk, CV, ilan, yapay zekâ (ai/), supabase/
│   ├── errors.ts   HttpHatasi ve alt sınıfları (400/401/403/404/422)
│   └── http.ts     api() sarmalayıcı, govde() doğrulayıcı
├── db/             Drizzle şeması (schema.ts) ve istemci (index.ts)
└── proxy.ts        Oturumu yeniler; server/middleware/erisim.ts kurallarını uygular
```

## Bağımlılık kuralı (tek yönlü)

`app` → `features` → (`layout`, `components/ui`, `server/lib`, `server/middleware`, `db`)
`server/routes` → `server/lib`, `server/middleware`, `db`

- `server/*` hiçbir zaman `features`, `layout`, `components` içe aktarmaz.
- `components/ui` alan bilgisi (ilan, hoca…) içermez; yalnızca görünüm.
- `features/<a>` başka bir özelliğin dosyasını yalnızca tanımlı dışa aktarım olarak kullanır (ör. `hata-bildir`, `basvurular/actions`).
- Sayfa dosyalarında iş mantığı yazılmaz; hesaplama `server/lib`'de saf fonksiyon olarak durur ve test edilir.

## İstek akışı

1. **Sayfa gezintisi:** `proxy.ts` oturumu yeniler. `erisim.ts` adres korumalıysa ve oturum yoksa `/giris`'e yönlendirir; bilinmeyen adres `not-found.tsx`.
2. **Sayfa:** `app/<rota>/page.tsx` → `features/<özellik>/<Ad>Sayfasi.tsx`. Veri çeken kısımlar `Suspense` içindedir (`cacheComponents` kuralı).
3. **Form/Server Action:** `features/<özellik>/actions.ts` → `kullaniciId()` ile kimlik → `server/lib` mantığı → `revalidatePath`/`redirect`.
4. **API:** `app/api/x/route.ts` → `server/routes/x.ts` → `api()` hataları JSON'a çevirir.
5. **Zamanlayıcı:** Vercel cron `/api/cron/dogrula` ve `/api/radar` uçlarını `Authorization: Bearer $CRON_SECRET` ile çağırır (`vercel.json`).

## Değişmez ilkeler (ürün)

- **Kaynak zorunlu:** İlan, laboratuvar, akademisyen bilgisi bir `kaynak` ve `dogrulama` kaydına bağlıdır (URL, tarih, yöntem). Kaynağı olmayan bilgi uyarıyla gösterilir.
- **Bilinmeyen bilinmiyor:** 30 günden eski kontrol ya da geçmiş son tarih → "bilinmiyor/kapalı" (`server/lib/freshness.ts`).
- **Alıntısız iddia yok:** Çıkarılan her şart/gerekçe kaynak metindeki bir cümleye dayanır (`server/lib/ai/alinti.ts`).
- **Sistem e-posta göndermez** (kayıtlı arama radarı hariç, o da yalnızca kullanıcının kendi adresine).
- **İlan siteleri kazınmaz** (Kariyer.net, Youthall, LinkedIn). Yalnızca resmî sayfalar, robots.txt'e uyarak; ya da kullanıcının yapıştırdığı metin (`/ilan-analiz`).
- **CV ve yapıştırılan ilan kaydedilmez**; yalnızca istek süresince bellekte işlenir.
- **Gizli anahtarlar** (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) istemciye verilmez; yalnızca `server/` kullanır.

## Test stratejisi

Testler kodun yanında (`*.test.ts`), Vitest ile. Saf mantık doğrudan; API uçları `vi.mock` ile oturum/yapay zekâ/veritabanı sahte tutularak çağrılır (`server/routes/routes.test.ts`). Veritabanına gerçekten bağlanan akışlar `scripts/` altındaki betiklerle elle doğrulanır. Komutlar: `npm run test`, `typecheck`, `lint`, `build`.

## Yeni özellik eklemek

1. Mantık varsa `server/lib/<ad>.ts` + `<ad>.test.ts` (saf fonksiyon).
2. API gerekiyorsa `server/routes/<ad>.ts` (`api()` ile), `app/api/<ad>/route.ts` tek satır, `CONTRACT.md`'ye ekle; oturum istemiyorsa `erisim.ts` `ACIK_API`'ya.
3. Arayüz: `features/<ad>/<Ad>Sayfasi.tsx` + `app/<rota>/page.tsx` kabuğu; oturum gerekiyorsa `erisim.ts` `KORUMALI_SAYFALAR`'a, menüye `layout/UstMenu.tsx`'e ekle.
4. Ortak görünüm gerekiyorsa `components/ui`; renk değeri gerekiyorsa `styles/tokens.css`.
