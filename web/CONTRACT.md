# Sözleşme

Hata biçimi (tüm API uçları): `{ "hata": "<Türkçe mesaj>" }`. Bilinmeyen hatalar `500 { "hata": "Beklenmeyen bir hata oluştu" }`; ayrıntı sızdırılmaz.

| Durum | Anlam |
|---|---|
| 400 | Geçersiz girdi (bozuk JSON, şemaya uymayan alan, geçersiz kimlik) |
| 401 | Oturum yok ya da zamanlayıcı gizli değeri yanlış |
| 403 | Yetki yok (yönetici gerekir) |
| 404 | Kayıt yok |
| 422 | İstek geçerli ama iş kuralı reddetti (profil eksik, doğrulanmış araştırma alanı yok) |

## API uçları (`server/routes`)

| Uç | Oturum | Girdi | Başarılı yanıt |
|---|---|---|---|
| `GET /api/takvim?id=<uuid>` | Hayır (herkese açık veri) | `id`: ilan kimliği | `text/calendar` (.ics). 400 geçersiz kimlik, 404 tarih yok |
| `POST /api/eslestir` | Evet | – | `{ adet: number }`. 422 profilde ilgi alanı yoksa |
| `POST /api/sartlar` | Evet | `{ ilanMetni: string(50–30000) }` | `{ sartlar: [{ metin, alinti, tur, normalizeKosul }] }` |
| `POST /api/eposta` | Evet | `{ kullaniciAdi, hedefAdi, hedefTuru, kanitliBeceriler[{ad,kanit}], dogrulanmisCalismaAlanlari[] }` | `{ taslak: string }` (gönderilmez). 422 doğrulanmış alan yoksa |
| `GET /api/takvim/abonelik?t=<anahtar>` | İmzalı anahtar (çerez değil) | `t`: `<kullanıcı-id>.<HMAC>` | `text/calendar`: kullanıcının takip ettiği başvuruların son tarihleri, 7 ve 1 gün önce hatırlatmalı. Anahtar yoksa/yanlışsa 401 |
| `GET /api/takvim/tum` | Hayır | – | `text/calendar`: tüm gerçek programların yaklaşan son tarihleri |
| `GET /api/radar` | Bearer `CRON_SECRET` | – | Radar özeti |
| `GET /api/cron/dogrula` | Bearer `CRON_SECRET` | – | Yeniden doğrulama özeti |

Diğer tüm `/api/*` adresleri oturum ister (`server/middleware/erisim.ts`).

## Sayfalar ve erişim

| Herkese açık | Oturum gerekir |
|---|---|
| `/` (keşfet), `/cv`, `/ilan-analiz`, `/takvim`, `/kaynaklar`, `/rehber`, `/hakkinda`, `/gizlilik`, `/firsat/[id]`, `/giris` | `/profil`, `/firsatlar`, `/laboratuvarlar`, `/hocalar`, `/basvurular`, `/aramalar`; `/yonetim` yalnızca `ADMIN_EMAILS` |

`/` arama parametreleri: `konu` (çoklu), `serbest`, `sehir`, `tur` (`staj|arastirma_staji|proje`), `acik=1`, `gercek=1` (DEMO gizle), sayfa: `ip` (fırsat), `gp` (laboratuvar), `hp` (akademisyen). Sayfa boyu 6.

## Server Action'lar (`features/*/actions`)

| Özellik | Eylem | Not |
|---|---|---|
| auth | `girisYap(fd)`, `cikisYap()` | `mod`: `giris`/`kayit`. `DEMO_HIZLI_KAYIT=1` iken kayıt onaysız açılır (yalnızca demo) |
| profil | `profilKaydet`, `beceriEkle`, `hesapSil` | `hesapSil`: onay alanına `SIL`; profil satırı ve zincirleme tüm kullanıcı verisi + auth kullanıcısı silinir |
| firsatlar | `eslestirAction`, `uygunlukKontrolAction` | Şartlar ilan başına bir kez çıkarılıp saklanır |
| basvurular | `basvuruEkle`, `akademisyenBasvuruEkle`, `durumGuncelle`, `taslakOlustur`, `akademisyenTaslakOlustur`, `taslakKaydet` | Taslak yalnızca kanıtlı becerileri kullanır; asla gönderilmez |
| aramalar | `aramaKaydet`, `aramaSil` | Bildirim açıksa radar kullanıcının kendi adresine e-posta atar |
| yonetim | `kuyrukCoz` | `adminZorunlu()`; elle doğrulama kaydı yazar |
| hata-bildir | `hataBildir(fd)` | Bildirim + kontrol kuyruğu kaydı |
| cv | `cvAnaliz(önceki, fd)` | `onay=1` zorunlu; dosya/metin kaydedilmez; JSX döndürür |
| ilan-analiz | `ilanAnaliz(önceki, fd)` | Yapıştırılan metin kaydedilmez |

## Veri sahipliği

Kullanıcıya ait tablolar (`kullanici_profili` kökü; `beceri`, `eslesme`, `basvuru`, `kayitli_arama` ona `ON DELETE CASCADE` bağlı). Herkese açık kaynaklı tablolar: `kurum`, `firsat`, `sart`, `arastirma_grubu`, `akademisyen`, `yayin`, `kaynak`, `dogrulama`, `kaynak_kutuphanesi`. Şema: `src/db/schema.ts`.
