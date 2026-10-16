import { asc, cosineDistance, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { firsat, kayitliArama, kurum } from "@/db/schema";
import { embed } from "./ai/embed";
import { kesinFiltre } from "./filters";
import { sehirUygun } from "./alternatif";

export type Kriterler = { konu: string; sehir?: string | null; uzaktan?: boolean | null };

/** Pure: son çalışmadan sonra eklenenler. İlk çalışmada (sonCalisma yok) hepsi yenidir. */
export function yeniOlanlar<T extends { olusturma: Date }>(adaylar: T[], sonCalisma: Date | null) {
  return sonCalisma ? adaylar.filter((a) => a.olusturma > sonCalisma) : adaylar;
}

export async function aramaSonuclari(k: Kriterler) {
  const [v] = await embed([k.konu], "query");
  const satirlar = await db
    .select({ f: firsat, kurumAdi: kurum.ad })
    .from(firsat)
    .innerJoin(kurum, eq(kurum.id, firsat.kurumId))
    .where(isNotNull(firsat.embedding))
    .orderBy(asc(cosineDistance(firsat.embedding, v)))
    .limit(40);
  return satirlar.filter(({ f }) =>
    kesinFiltre(
      { sehir: f.sehir, uzaktan: f.uzaktan, durum: f.durum, sonKontrol: new Date(), // sonKontrol: radar yalnızca durumu "kapalı" olanları eler
        sonBasvuru: f.sonBasvuru ? new Date(f.sonBasvuru) : null },
      { sehir: k.sehir, uzaktan: k.uzaktan },
    ) && sehirUygun(f, k.sehir ?? null));
}

async function epostaGonder(to: string, konu: string, metin: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.RADAR_FROM, to, subject: konu, text: metin }),
  });
  if (!r.ok) throw new Error(`E-posta gönderilemedi: ${r.status}`);
}

/** Bildirimi açık tüm kayıtlı aramaları çalıştırır; yeni fırsat varsa araması sahibine e-posta atar. */
export async function radariCalistir(kullaniciEposta: (uid: string) => Promise<string | null>) {
  const aramalar = await db.select().from(kayitliArama).where(eq(kayitliArama.bildirim, true));
  let gonderilen = 0;
  for (const a of aramalar) {
    const yeni = yeniOlanlar((await aramaSonuclari(a.kriterler as Kriterler)).map((r) => ({ ...r, olusturma: r.f.olusturma })), a.sonCalisma);
    if (yeni.length) {
      const eposta = await kullaniciEposta(a.kullaniciId);
      if (eposta) {
        await epostaGonder(eposta, `${yeni.length} yeni staj fırsatı`,
          yeni.map(({ f, kurumAdi }) => `• ${f.baslik} — ${kurumAdi} (durum: ${f.durum})`).join("\n") +
          "\n\nBilgiler değişmiş olabilir; başvurmadan önce resmî sayfadan kontrol et.");
        gonderilen++;
      }
    }
    await db.update(kayitliArama).set({ sonCalisma: new Date() }).where(eq(kayitliArama.id, a.id));
  }
  return { aramaSayisi: aramalar.length, gonderilen };
}
