import { asc, cosineDistance, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { akademisyen, kurum, yayin } from "@/db/schema";
import { embed } from "./ai/embed";
import { anahtarGecer, bagilGecer } from "./konu";

export type HocaSonucu = {
  akademisyenId: string; ad: string; unvan: string | null; kurumAdi: string;
  resmiProfilUrl: string | null; konular: string[];
  yayinlar: { baslik: string; yil: number | null; doi: string | null }[];
  kurumSehir: string | null;
};

/** Ham yayın isabetlerini hoca başına toplar (pure; test edilir). En yakın yayına göre sıralar, hoca başına en fazla `yayinSayisi` yayın. */
export function hocaBazliTopla<T extends { akademisyenId: string }>(isabetler: T[], hocaSayisi = 15, yayinSayisi = 3) {
  const gruplar = new Map<string, T[]>();
  for (const h of isabetler) {
    const g = gruplar.get(h.akademisyenId) ?? [];
    if (g.length < yayinSayisi) g.push(h);
    gruplar.set(h.akademisyenId, g);
  }
  return [...gruplar.values()].slice(0, hocaSayisi); // girdi mesafeye göre sıralı olduğundan ilk yayın en yakın olandır
}

export type HocaBulSecenek = { hocaSayisi?: number; anahtar?: string[]; bagilKapi?: boolean; sehir?: string };

/** `anahtar` doluysa yalnızca kişinin KENDİ ana konuları bu sözcüklerden birini içeren akademisyenler sayılır (tek bir yayının etiketi ya da başlığı yetmez).
 *  `bagilKapi`: serbest metinde en iyi yayına yakın olmayanları eler. */
export async function hocaBul(konuMetni: string, { hocaSayisi = 15, anahtar = [], bagilKapi = false, sehir = "" }: HocaBulSecenek = {}): Promise<HocaSonucu[]> {
  const [v] = await embed([konuMetni], "query");
  const mesafe = cosineDistance(yayin.embedding, v);
  const ham = await db
    .select({
      akademisyenId: akademisyen.id, ad: akademisyen.ad, unvan: akademisyen.unvan, kurumAdi: kurum.ad, kurumSehir: kurum.sehir,
      resmiProfilUrl: akademisyen.resmiProfilUrl, konular: akademisyen.konular,
      baslik: yayin.baslik, yil: yayin.yil, doi: yayin.doi, etiketler: yayin.konuEtiketleri, mesafe,
    })
    .from(yayin)
    .innerJoin(akademisyen, eq(akademisyen.id, yayin.akademisyenId))
    .innerJoin(kurum, eq(kurum.id, akademisyen.kurumId))
    .where(isNotNull(yayin.embedding))
    .orderBy(asc(mesafe))
    .limit(400);

  const enIyi = ham.length ? 1 - Number(ham[0].mesafe) : 0;
  const sehirKucuk = sehir.trim().toLocaleLowerCase("tr-TR");
  const isabetler = ham
    .filter((h) => anahtarGecer((h.konular ?? []).join(" "), anahtar))
    .filter((h) => !sehirKucuk || (h.kurumSehir ?? "").toLocaleLowerCase("tr-TR").includes(sehirKucuk))
    .filter((h) => !bagilKapi || bagilGecer(1 - Number(h.mesafe), enIyi, 0.05));

  return hocaBazliTopla(isabetler, hocaSayisi).map((g) => ({
    akademisyenId: g[0].akademisyenId, ad: g[0].ad, unvan: g[0].unvan, kurumAdi: g[0].kurumAdi,
    resmiProfilUrl: g[0].resmiProfilUrl, konular: g[0].konular ?? [],
    yayinlar: g.map(({ baslik, yil, doi }) => ({ baslik, yil, doi })), kurumSehir: g[0].kurumSehir,
  }));
}
