import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { beceri, kullaniciProfili } from "@/db/schema";
import { supabaseSunucu } from "@/server/lib/supabase/server";
import { kullaniciId } from "@/server/middleware/rbac";

/** Profil sayfasının bileşenleri aynı istek içinde tek sorguyla beslenir (React cache). */
export const profilVerisi = cache(async () => {
  const uid = await kullaniciId();
  const [p] = await db.select().from(kullaniciProfili).where(eq(kullaniciProfili.id, uid));
  const bec = await db.select().from(beceri).where(eq(beceri.kullaniciId, uid));
  let eposta = "";
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) eposta = (await (await supabaseSunucu()).auth.getUser()).data.user?.email ?? "";
  const kanitli = bec.filter((b) => (b.kanit ?? "").trim());
  return { uid, p: p ?? null, bec, kanitli, beyan: bec.filter((b) => !(b.kanit ?? "").trim()), eposta };
});

export const gorunenAd = (eposta: string) => {
  const yerel = eposta.split("@")[0] || "Öğrenci";
  return yerel.charAt(0).toLocaleUpperCase("tr-TR") + yerel.slice(1);
};
