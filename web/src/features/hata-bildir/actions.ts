"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { hataBildirimi, kontrolKuyrugu } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";

const Form = z.object({
  varlikTuru: z.enum(["firsat", "grup", "akademisyen"]),
  varlikId: z.string().uuid(),
  aciklama: z.string().min(10).max(1000),
});

/** Doğrulama kuralı 6: bildirim kaydedilir ve kontrol kuyruğuna alınır. */
export async function hataBildir(fd: FormData) {
  const v = Form.parse(Object.fromEntries(fd));
  const [k] = await db.insert(kontrolKuyrugu).values({
    varlikTuru: v.varlikTuru, varlikId: v.varlikId, neden: "kullanici_bildirimi", not: v.aciklama,
  }).returning();
  await db.insert(hataBildirimi).values({
    kullaniciId: await kullaniciId(), varlikTuru: v.varlikTuru, varlikId: v.varlikId, aciklama: v.aciklama, kuyrukId: k.id,
  });
  revalidatePath("/yonetim");
}
