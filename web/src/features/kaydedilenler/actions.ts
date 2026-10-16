"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { kaydetDegistir } from "@/server/lib/kayitli";
import { kullaniciIdOpsiyonel } from "@/server/middleware/rbac";

export type KaydetSonucu = { durum: "kaydedildi" | "kaldirildi" | "giris" | "yok" };

/** Programı kaydeder ya da kaydı kaldırır. Oturum yoksa kaydetmez; arayüz giriş sayfasına yönlendirir. */
export async function kaydetDegistirAction(firsatId: string): Promise<KaydetSonucu> {
  const id = z.string().uuid().safeParse(firsatId);
  if (!id.success) return { durum: "yok" };
  const uid = await kullaniciIdOpsiyonel();
  if (!uid) return { durum: "giris" };
  const sonuc = await kaydetDegistir(uid, id.data);
  if (!sonuc) return { durum: "yok" };
  revalidatePath("/kaydedilenler");
  return { durum: sonuc };
}
