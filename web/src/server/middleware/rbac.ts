import { connection } from "next/server";
import { OturumGerekli, Yasak } from "../errors";
import { supabaseSunucu } from "../lib/supabase/server";

/** Oturum açmış kullanıcının kimliği. Supabase tanımlı değilse yerelde DEV_USER_ID'ye düşer (production'da asla). */
export async function kullaniciId(): Promise<string> {
  await connection(); // isteğe özel çağrı: derleme sırasında önceden üretilmesin
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (process.env.NODE_ENV !== "production" && process.env.DEV_USER_ID) return process.env.DEV_USER_ID;
    throw new Error("Supabase tanımlı değil.");
  }
  const { data } = await (await supabaseSunucu()).auth.getUser();
  if (!data.user) throw new OturumGerekli("Oturum açılmamış.");
  return data.user.id;
}

/** Oturum varsa kullanıcı kimliği, yoksa null. Herkese açık sayfalarda "bu kullanıcı kaydetmiş mi?" bilgisi için; yetki kararı vermez. */
export async function kullaniciIdOpsiyonel(): Promise<string | null> {
  try {
    return await kullaniciId();
  } catch (e) {
    if (e instanceof OturumGerekli) return null;
    if (e instanceof Error && e.message === "Supabase tanımlı değil.") return null;
    throw e;
  }
}

/** Yönetici: ADMIN_EMAILS (virgülle ayrılmış) içindeki oturum açmış kullanıcı. */
export function adminMi(eposta: string | undefined | null, liste = process.env.ADMIN_EMAILS ?? ""): boolean {
  if (!eposta) return false;
  return liste.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).includes(eposta.toLowerCase());
}

export async function adminZorunlu(): Promise<void> {
  await connection();
  const { data } = await (await supabaseSunucu()).auth.getUser();
  if (!adminMi(data.user?.email)) throw new Yasak("Yetkisiz");
}
