"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { akademisyen, basvuru, basvuruDurumu, beceri, dogrulama, firsat, kurum, yayin } from "@/db/schema";
import { epostaTaslagi } from "@/server/lib/ai/claude";
import { kullaniciId } from "@/server/middleware/rbac";

export async function durumGuncelle(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const durum = z.enum(basvuruDurumu.enumValues).parse(fd.get("durum"));
  await db.update(basvuru).set({ durum })
    .where(and(eq(basvuru.id, id), eq(basvuru.kullaniciId, await kullaniciId())));
  revalidatePath("/basvurular");
}

export async function basvuruEkle(fd: FormData) {
  const firsatId = z.string().uuid().parse(fd.get("firsatId"));
  await db.insert(basvuru).values({ kullaniciId: await kullaniciId(), firsatId });
  revalidatePath("/basvurular");
}

export async function taslakOlustur(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const uid = await kullaniciId();
  const [satir] = await db
    .select({ b: basvuru, f: firsat, kurumAdi: kurum.ad })
    .from(basvuru)
    .innerJoin(firsat, eq(firsat.id, basvuru.firsatId))
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(and(eq(basvuru.id, id), eq(basvuru.kullaniciId, uid)));
  if (!satir) return;
  const bec = await db.select().from(beceri).where(eq(beceri.kullaniciId, uid));
  const taslak = await epostaTaslagi({
    kullaniciAdi: "",
    hedefAdi: `${satir.kurumAdi} (${satir.f.baslik})`,
    hedefTuru: "sirket",
    kanitliBeceriler: bec.filter((b) => b.kanit).map((b) => ({ ad: b.ad, kanit: b.kanit! })),
    dogrulanmisCalismaAlanlari: [],
  });
  await db.update(basvuru).set({ epostaTaslagi: taslak }).where(eq(basvuru.id, id));
  revalidatePath("/basvurular");
}

export async function taslakKaydet(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  await db.update(basvuru).set({ epostaTaslagi: String(fd.get("taslak") ?? "") })
    .where(and(eq(basvuru.id, id), eq(basvuru.kullaniciId, await kullaniciId())));
  revalidatePath("/basvurular");
}

export async function akademisyenBasvuruEkle(fd: FormData) {
  const akademisyenId = z.string().uuid().parse(fd.get("akademisyenId"));
  await db.insert(basvuru).values({ kullaniciId: await kullaniciId(), akademisyenId });
  revalidatePath("/basvurular");
}

/** Akademisyen taslağı: yalnızca Doğrulama tablosundaki konular ve DOI'li yayın başlıkları modele verilir. */
export async function akademisyenTaslakOlustur(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const uid = await kullaniciId();
  const [satir] = await db
    .select({ b: basvuru, h: akademisyen })
    .from(basvuru)
    .innerJoin(akademisyen, eq(akademisyen.id, basvuru.akademisyenId))
    .where(and(eq(basvuru.id, id), eq(basvuru.kullaniciId, uid)));
  if (!satir) return;
  const konular = await db.select().from(dogrulama).where(and(
    eq(dogrulama.varlikTuru, "akademisyen"), eq(dogrulama.varlikId, satir.h.id), eq(dogrulama.alan, "konular")));
  const yayinlar = await db.select().from(yayin).where(eq(yayin.akademisyenId, satir.h.id)).limit(2);
  const alanlar = [
    ...konular.flatMap((k) => (k.deger ?? "").split(", ").filter(Boolean)),
    ...yayinlar.map((y) => `yayın: ${y.baslik}`),
  ];
  const bec = await db.select().from(beceri).where(eq(beceri.kullaniciId, uid));
  const taslak = await epostaTaslagi({
    kullaniciAdi: "",
    hedefAdi: `${satir.h.unvan ?? ""} ${satir.h.ad}`.trim(),
    hedefTuru: "akademisyen",
    kanitliBeceriler: bec.filter((b) => b.kanit).map((b) => ({ ad: b.ad, kanit: b.kanit! })),
    dogrulanmisCalismaAlanlari: alanlar,
  });
  await db.update(basvuru).set({ epostaTaslagi: taslak }).where(eq(basvuru.id, id));
  revalidatePath("/basvurular");
}
