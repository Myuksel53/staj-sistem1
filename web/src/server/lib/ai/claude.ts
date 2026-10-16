import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { alintiGecerli } from "./alinti";
import { kuralEposta, kuralSartlari, kuralSiralama } from "./kural";

export const MODEL = "claude-sonnet-5-5";
/** Anahtar yoksa (veya LLM_MODE=yok) kural tabanlı yedekler çalışır. */
export const llmVar = () => !!process.env.ANTHROPIC_API_KEY && process.env.LLM_MODE !== "yok";
const client = () => new Anthropic(); // ANTHROPIC_API_KEY ortam değişkeninden

const SartlarSema = z.object({
  sartlar: z.array(z.object({
    metin: z.string(),
    alinti: z.string(),
    tur: z.enum(["zorunlu", "tercih"]),
    normalizeKosul: z.string().nullable(), // "sinif>=3" | "ortalama>=2.5" | "beceri:python" | null
  })),
});
export type CikarilanSart = z.infer<typeof SartlarSema>["sartlar"][number];

function jsonAyikla(metin: string): unknown {
  const m = metin.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Model JSON döndürmedi");
  return JSON.parse(m[0]);
}

async function sor(system: string, user: string, maxTokens = 2000): Promise<string> {
  const r = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

/** İlan metninden şartları çıkarır; metinde geçmeyen alıntılı şartları eler. */
export async function sartlariCikar(ilanMetni: string): Promise<CikarilanSart[]> {
  if (!llmVar()) return kuralSartlari(ilanMetni).filter((s) => alintiGecerli(s.alinti, ilanMetni));
  const out = await sor(
    "Staj ilanından başvuru şartlarını çıkar. Yalnızca metinde yazanı kullan. Her şart için metinden birebir alıntı ver. " +
      'Yalnızca JSON döndür: {"sartlar":[{"metin":"","alinti":"","tur":"zorunlu|tercih","normalizeKosul":"sinif>=3 | ortalama>=2.5 | beceri:python | null"}]}',
    ilanMetni,
  );
  const { sartlar } = SartlarSema.parse(jsonAyikla(out));
  return sartlar.filter((s) => alintiGecerli(s.alinti, ilanMetni));
}

export type EpostaGirdi = {
  kullaniciAdi: string;
  hedefAdi: string; // akademisyen veya şirket
  hedefTuru: "akademisyen" | "sirket";
  kanitliBeceriler: { ad: string; kanit: string }[];
  dogrulanmisCalismaAlanlari: string[]; // yalnızca Doğrulama tablosundan
};

/** E-posta taslağı: yalnızca kanıtlı beceriler ve doğrulanmış alanlar verilir. Gönderim yok. */
export async function epostaTaslagi(g: EpostaGirdi): Promise<string> {
  if (g.hedefTuru === "akademisyen" && g.dogrulanmisCalismaAlanlari.length === 0) {
    throw new Error("Doğrulanmış çalışma alanı yok; taslak üretilmedi.");
  }
  if (!llmVar()) return kuralEposta(g);
  return sor(
    "Türkçe, kısa ve saygılı bir staj/araştırma başvuru e-postası taslağı yaz. " +
      "Yalnızca verilen becerileri ve çalışma alanlarını an; başka bilgi, yayın adı veya başarı uydurma. Konu satırı ekle.",
    JSON.stringify(g),
    1000,
  );
}

const SiralamaSema = z.object({
  sonuclar: z.array(z.object({
    firsatId: z.string(),
    puan: z.number().min(0).max(100),
    gerekceler: z.array(z.object({ metin: z.string(), alinti: z.string() })),
  })),
});
export type SiralanmisAday = z.infer<typeof SiralamaSema>["sonuclar"][number];

export type SiralamaAdayi = { firsatId: string; baslik: string; kurum: string; metin: string; benzerlik?: number };

/** Aşama 3: LLM yalnızca sıralar ve açıklar. Alıntısı ilan metninde bulunmayan gerekçe atılır; gerekçesiz aday elenir. */
export async function adaylariSirala(profilMetni: string, adaylar: SiralamaAdayi[]): Promise<SiralanmisAday[]> {
  if (!adaylar.length) return [];
  if (!llmVar()) return kuralSiralama(adaylar);
  const out = await sor(
    "Öğrenci profiline göre adayları 0-100 puanla ve sırala. Her gerekçe için ilan metninden birebir alıntı ver. " +
      'Yalnızca JSON döndür: {"sonuclar":[{"firsatId":"","puan":0,"gerekceler":[{"metin":"","alinti":""}]}]}',
    JSON.stringify({ profil: profilMetni, adaylar }),
    4000,
  );
  const metinler = new Map(adaylar.map((a) => [a.firsatId, a.metin]));
  return SiralamaSema.parse(jsonAyikla(out)).sonuclar
    .filter((s) => metinler.has(s.firsatId))
    .map((s) => ({
      ...s,
      gerekceler: s.gerekceler.filter((g) => alintiGecerli(g.alinti, metinler.get(s.firsatId)!)),
    }))
    .filter((s) => s.gerekceler.length > 0)
    .sort((a, b) => b.puan - a.puan);
}
