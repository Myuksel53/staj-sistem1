import { createHmac, timingSafeEqual } from "node:crypto";

/** Kişisel takvim adresi için imzalı anahtar: "<kullanıcı-id>.<imza>". Takvim uygulamaları oturum çerezi gönderemez; adres gizli anahtar gibi davranır.
 *  İmza HMAC-SHA256'dır; sunucu gizlisi olmadan üretilemez ve kullanıcı kimliği değiştirilemez. Veritabanında saklanmaz. */
const imza = (uid: string, gizli: string) => createHmac("sha256", gizli).update(`takvim:${uid}`).digest("base64url");

export function takvimAnahtariUret(uid: string, gizli: string | undefined): string | null {
  if (!gizli) return null;
  return `${uid}.${imza(uid, gizli)}`;
}

/** Geçerliyse kullanıcı kimliğini, değilse null döner. */
export function takvimAnahtariDogrula(anahtar: string | null | undefined, gizli: string | undefined): string | null {
  if (!gizli || !anahtar) return null;
  const nokta = anahtar.lastIndexOf(".");
  if (nokta < 1) return null;
  const uid = anahtar.slice(0, nokta);
  if (!/^[0-9a-f-]{36}$/i.test(uid)) return null;
  const beklenen = Buffer.from(imza(uid, gizli)), gelen = Buffer.from(anahtar.slice(nokta + 1));
  return beklenen.length === gelen.length && timingSafeEqual(beklenen, gelen) ? uid : null;
}
