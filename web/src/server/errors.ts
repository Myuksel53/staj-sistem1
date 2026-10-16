/** API katmanının bilinen hata türleri. `api()` bunları uygun HTTP durumuna çevirir; bunların dışındaki hatalar 500 olur ve ayrıntı sızdırılmaz. */
export class HttpHatasi extends Error {
  constructor(readonly durum: number, mesaj: string) {
    super(mesaj);
    this.name = new.target.name;
  }
}
export class GecersizIstek extends HttpHatasi { constructor(mesaj = "Geçersiz girdi") { super(400, mesaj); } }
export class OturumGerekli extends HttpHatasi { constructor(mesaj = "Oturum gerekli") { super(401, mesaj); } }
export class Yasak extends HttpHatasi { constructor(mesaj = "Yetkisiz") { super(403, mesaj); } }
export class Bulunamadi extends HttpHatasi { constructor(mesaj = "Bulunamadı") { super(404, mesaj); } }
/** İş kuralı reddi (ör. profil eksik, doğrulanmış araştırma alanı yok): istek geçerli ama işlenemez. */
export class IslenemezIstek extends HttpHatasi { constructor(mesaj: string) { super(422, mesaj); } }
