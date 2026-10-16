"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eslestir } from "@/server/lib/eslestirme";
import { sartlariHazirla } from "@/server/lib/sartlar";
import { kullaniciId } from "@/server/middleware/rbac";

export async function eslestirAction() {
  await eslestir(await kullaniciId());
  revalidatePath("/firsatlar");
}

export async function uygunlukKontrolAction(fd: FormData) {
  await kullaniciId();
  await sartlariHazirla(z.string().uuid().parse(fd.get("firsatId")));
  revalidatePath("/firsatlar");
}
