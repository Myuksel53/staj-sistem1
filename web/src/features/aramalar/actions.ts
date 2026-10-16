"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kayitliArama } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";

export async function aramaKaydet(fd: FormData) {
  const v = z.object({
    konu: z.string().min(5), sehir: z.string().optional(),
    uzaktan: z.enum(["evet", "hayir", "farketmez"]), bildirim: z.string().optional(),
  }).parse(Object.fromEntries(fd));
  await db.insert(kayitliArama).values({
    kullaniciId: await kullaniciId(),
    kriterler: { konu: v.konu, sehir: v.sehir || null, uzaktan: v.uzaktan === "farketmez" ? null : v.uzaktan === "evet" },
    bildirim: v.bildirim === "on",
  });
  revalidatePath("/aramalar");
}

export async function aramaSil(fd: FormData) {
  await db.delete(kayitliArama).where(and(
    eq(kayitliArama.id, z.string().uuid().parse(fd.get("id"))), eq(kayitliArama.kullaniciId, await kullaniciId())));
  revalidatePath("/aramalar");
}
