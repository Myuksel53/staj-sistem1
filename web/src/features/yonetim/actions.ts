"use server";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { arastirmaGrubu, dogrulama, firsat, kontrolKuyrugu } from "@/db/schema";
import { adminZorunlu } from "@/server/middleware/rbac";

const Form = z.object({
  id: z.string().uuid(),
  sonuc: z.enum(["acik", "kapali", "bilinmiyor", "kabul_ediyor", "kabul_etmiyor", "degisiklik_yok", "gecersiz"]),
});

/** Kuyruk kaydını elle çözer: yeni durum Doğrulama'ya (yöntem: elle) yazılır, varlık güncellenir. */
export async function kuyrukCoz(fd: FormData) {
  await adminZorunlu();
  const v = Form.parse(Object.fromEntries(fd));
  const [k] = await db.select().from(kontrolKuyrugu).where(eq(kontrolKuyrugu.id, v.id));
  if (!k || k.durum !== "bekliyor") return;

  if (v.sonuc === "gecersiz") {
    await db.update(kontrolKuyrugu).set({ durum: "gecersiz", cozulme: new Date() }).where(eq(kontrolKuyrugu.id, k.id));
  } else {
    // Elle doğrulama bir kaynağa bağlanmak zorunda: kuyruğun kaynağı, yoksa varlığın en son doğrulama kaynağı.
    let kaynakId = k.kaynakId;
    if (!kaynakId) {
      const [son] = await db.select().from(dogrulama).where(eq(dogrulama.varlikId, k.varlikId)).orderBy(desc(dogrulama.kontrolTarihi)).limit(1);
      kaynakId = son?.kaynakId ?? null;
    }
    if (!kaynakId) throw new Error("Bu varlığın doğrulama kaynağı yok; önce kaynak ekle.");

    const alan = k.varlikTuru === "firsat" ? "durum" : "kabul";
    if (v.sonuc !== "degisiklik_yok") {
      if (k.varlikTuru === "firsat" && ["acik", "kapali", "bilinmiyor"].includes(v.sonuc)) {
        await db.update(firsat).set({ durum: v.sonuc as "acik" | "kapali" | "bilinmiyor" }).where(eq(firsat.id, k.varlikId));
      } else if (k.varlikTuru === "grup" && ["kabul_ediyor", "kabul_etmiyor", "bilinmiyor"].includes(v.sonuc)) {
        await db.update(arastirmaGrubu).set({ kabul: v.sonuc as "kabul_ediyor" | "kabul_etmiyor" | "bilinmiyor" }).where(eq(arastirmaGrubu.id, k.varlikId));
      } else {
        throw new Error("Bu sonuç bu varlık türü için geçerli değil.");
      }
    }
    await db.insert(dogrulama).values({
      varlikTuru: k.varlikTuru, varlikId: k.varlikId, alan,
      deger: v.sonuc === "degisiklik_yok" ? null : v.sonuc, kaynakId, yontem: "elle",
    });
    await db.update(kontrolKuyrugu).set({ durum: "cozuldu", cozulme: new Date() }).where(eq(kontrolKuyrugu.id, k.id));
  }
  revalidatePath("/yonetim");
}
