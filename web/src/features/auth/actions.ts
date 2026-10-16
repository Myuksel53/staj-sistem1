"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseYonetici } from "@/server/lib/supabase/admin";
import { supabaseSunucu } from "@/server/lib/supabase/server";

const Form = z.object({ email: z.string().email(), sifre: z.string().min(8), mod: z.enum(["giris", "kayit"]) });

const MESAJ: Record<string, string> = {
  "Invalid login credentials": "E-posta veya şifre hatalı. Hesabın yoksa önce “Kayıt ol” düğmesine bas.",
  "Email not confirmed": "Hesap henüz onaylanmamış. E-postana gelen onay bağlantısına tıkla.",
  "User already registered": "Bu e-posta zaten kayıtlı. “Giriş yap” düğmesini kullan.",
};
const git = (mesaj: string) => redirect(`/giris?hata=${encodeURIComponent(MESAJ[mesaj] ?? mesaj)}`);

export async function girisYap(fd: FormData) {
  const girdi = Form.safeParse(Object.fromEntries(fd));
  if (!girdi.success) {
    const alan = girdi.error.issues[0]?.path[0];
    git(alan === "sifre" ? "Şifre en az 8 karakter olmalı." : "Geçerli bir e-posta adresi yaz (ör. ad@gmail.com).");
    return;
  }
  const v = girdi.data;
  const supabase = await supabaseSunucu();
  if (v.mod === "kayit") {
    // Demo: e-posta onayı beklemeden hesabı onaylı aç. Yalnızca DEMO_HIZLI_KAYIT=1 iken; gerçek kullanımda kapalı tut.
    if (process.env.DEMO_HIZLI_KAYIT === "1") {
      const yonetici = supabaseYonetici();
      const { error } = await yonetici.auth.admin.createUser({ email: v.email, password: v.sifre, email_confirm: true });
      if (error) git(error.message.includes("already") ? "User already registered" : error.message);
      const giris = await supabase.auth.signInWithPassword({ email: v.email, password: v.sifre });
      if (giris.error) git(giris.error.message);
      redirect("/profil");
    }
    const { data, error } = await supabase.auth.signUp({ email: v.email, password: v.sifre });
    if (error) git(error.message);
    // Confirm email açıksa oturum gelmez: kullanıcıyı yanıltmadan bilgilendir.
    if (!data?.session) git("Kayıt alındı ama hesap onay bekliyor. E-postandaki bağlantıya tıkla (ya da yönetici onay şartını kapatmalı).");
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.sifre });
    if (error) git(error.message);
  }
  redirect("/profil");
}

export async function cikisYap() {
  await (await supabaseSunucu()).auth.signOut();
  redirect("/giris");
}
