// Yerel, ücretsiz çok dilli model (384 boyut = schema.ts EMBED_DIM). API anahtarı gerekmez.
// İlk çağrıda model (~120 MB) indirilir ve önbelleğe alınır.
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

const MODEL = "Xenova/multilingual-e5-small";
let hazir: Promise<FeatureExtractionPipeline> | null = null;

/** e5 modelleri girdi başına önek ister: sorgu için "query: ", saklanan metin için "passage: ". */
export const onekle = (metin: string, tur: "document" | "query") => `${tur === "query" ? "query" : "passage"}: ${metin}`;

export async function embed(metinler: string[], girdiTuru: "document" | "query"): Promise<number[][]> {
  hazir ??= pipeline("feature-extraction", MODEL) as Promise<FeatureExtractionPipeline>;
  const ext = await hazir;
  const cikti = await ext(metinler.map((m) => onekle(m.slice(0, 2000), girdiTuru)), { pooling: "mean", normalize: true });
  return cikti.tolist() as number[][];
}
