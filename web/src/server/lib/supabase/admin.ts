import { createClient } from "@supabase/supabase-js";

/** Yalnızca sunucuda: service role anahtarı istemciye verilmez. Kullanıcı silme ve demo kaydı gibi yönetici işleri için. */
export function supabaseYonetici() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
