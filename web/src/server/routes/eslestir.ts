import { IslenemezIstek } from "../errors";
import { api } from "../http";
import { eslestir } from "../lib/eslestirme";
import { kullaniciId } from "../middleware/rbac";

/** POST /api/eslestir — oturumdaki kullanıcının profiliyle eşleştirmeyi çalıştırır. Profil eksikse 422. */
export const POST = api(async () => {
  const uid = await kullaniciId();
  const sonuc = await eslestir(uid).catch((e: Error) => {
    if (e.message.startsWith("Önce profilde")) throw new IslenemezIstek(e.message);
    throw e;
  });
  return Response.json({ adet: sonuc.length });
});
