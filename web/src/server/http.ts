import { z } from "zod";
import { GecersizIstek, HttpHatasi } from "./errors";

type Isleyici = (req: Request) => Promise<Response>;

/** Route işleyicisini sarar: bilinen hatalar `{hata}` JSON'una, bilinmeyenler genel 500'e çevrilir. İstek gövdesi ve iç hata ayrıntısı loglanmaz. */
export function api(isleyici: Isleyici): Isleyici {
  return async (req) => {
    try {
      return await isleyici(req);
    } catch (e) {
      if (e instanceof HttpHatasi) return Response.json({ hata: e.message }, { status: e.durum });
      // Next.js'in akış kontrol hataları (dinamik kullanım, yönlendirme, bulunamadı…) `digest` taşır; yutulmamalı.
      if (typeof e === "object" && e !== null && "digest" in e) throw e;
      // Üretimde yalnızca hata türü loglanır; geliştirme modunda ayıklamak için ileti de yazılır (istek gövdesi hiçbir zaman yazılmaz).
      console.error("API hatası:", e instanceof Error ? (process.env.NODE_ENV === "production" ? e.name : `${e.name}: ${e.message}`) : "bilinmeyen");
      return Response.json({ hata: "Beklenmeyen bir hata oluştu" }, { status: 500 });
    }
  };
}

/** JSON gövdeyi şemayla doğrular; bozuk ya da uymayan gövde 400. */
export async function govde<T>(req: Request, sema: z.ZodType<T>): Promise<T> {
  const sonuc = sema.safeParse(await req.json().catch(() => null));
  if (!sonuc.success) throw new GecersizIstek();
  return sonuc.data;
}
