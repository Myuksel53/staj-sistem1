"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { beceri, kayitliFirsat, kullaniciProfili } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";
import { supabaseYonetici } from "@/server/lib/supabase/admin";
import { supabaseSunucu } from "@/server/lib/supabase/server";

const Form = z.object({
  bolum: z.string().min(1),
  sinif: z.coerce.number().int().min(1).max(6),
  ortalama: z.coerce.number().min(0).max(4).optional(),
  ilgiAlanlari: z.string().min(10),
  sehir: z.string().optional(),
  uzaktan: z.enum(["evet", "hayir", "farketmez"]),
  ulkeler: z.string().optional(), // "TR, DE"
});

export async function profilKaydet(fd: FormData) {
  const v = Form.parse(Object.fromEntries(fd));
  const id = await kullaniciId();
  const deger = {
    bolum: v.bolum, sinif: v.sinif, ortalama: v.ortalama ?? null, ilgiAlanlari: v.ilgiAlanlari,
    sehir: v.sehir || null,
    ulkeler: (v.ulkeler ?? "").split(",").map((u) => u.trim().toUpperCase()).filter((u) => /^[A-Z]{2}$/.test(u)), uzaktan: v.uzaktan === "farketmez" ? null : v.uzaktan === "evet",
  };
  await db.insert(kullaniciProfili).values({ id, ...deger })
    .onConflictDoUpdate({ target: kullaniciProfili.id, set: deger });
  revalidatePath("/profil");
  redirect("/profil?kaydedildi=1");
}

export async function beceriEkle(fd: FormData) {
  const v = z.object({ ad: z.string().min(1), kanit: z.string().optional() }).parse(Object.fromEntries(fd));
  await db.insert(beceri).values({ kullaniciId: await kullaniciId(), ad: v.ad, kanit: v.kanit || null });
  revalidatePath("/profil");
}

/** Mevcut beceriye kanıt ekler/günceller (proje, sertifika, ders). Kanıt eklenince beceri uygunluk analizinde "karşılıyor" sayılır. */
export async function beceriKanitKaydet(fd: FormData) {
  const v = z.object({ id: z.string().uuid(), kanit: z.string().trim().min(3, "Kanıt en az 3 karakter olmalı").max(300) }).parse(Object.fromEntries(fd));
  await db.update(beceri).set({ kanit: v.kanit }).where(and(eq(beceri.id, v.id), eq(beceri.kullaniciId, await kullaniciId())));
  revalidatePath("/profil");
}

export async function beceriSil(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  await db.delete(beceri).where(and(eq(beceri.id, id), eq(beceri.kullaniciId, await kullaniciId())));
  revalidatePath("/profil");
}

/** KVKK: hesabı ve ona bağlı her şeyi siler. Profil satırı silinince beceri, eşleşme, başvuru ve kayıtlı aramalar zincirleme gider. */
export async function hesapSil(fd: FormData) {
  if (fd.get("onay") !== "SIL") redirect("/profil?silme=onaysiz");
  const id = await kullaniciId();
  await db.delete(kayitliFirsat).where(eq(kayitliFirsat.kullaniciId, id)); // profil satırına bağlı olmayan tablo, açıkça silinir
  await db.delete(kullaniciProfili).where(eq(kullaniciProfili.id, id));
  await supabaseYonetici().auth.admin.deleteUser(id);
  await (await supabaseSunucu()).auth.signOut();
  redirect("/?hesap=silindi");
}
