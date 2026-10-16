// Embedding'i boş olan yayın ve akademisyenleri doldurur. Kullanım: npm run embed
import { eq, isNull } from "drizzle-orm";
import { db } from "../src/db";
import { akademisyen, yayin } from "../src/db/schema";
import { embed } from "../src/server/lib/ai/embed";

const PARTI = 64;

const yayinlar = await db.select().from(yayin).where(isNull(yayin.embedding));
for (let i = 0; i < yayinlar.length; i += PARTI) {
  const dilim = yayinlar.slice(i, i + PARTI);
  const v = await embed(dilim.map((y) => `${y.baslik}\n${y.ozet ?? ""}`.slice(0, 4000)), "document");
  for (const [k, y] of dilim.entries()) await db.update(yayin).set({ embedding: v[k] }).where(eq(yayin.id, y.id));
  console.log(`yayın ${i + dilim.length}/${yayinlar.length}`);
}

const hocalar = await db.select().from(akademisyen).where(isNull(akademisyen.embedding));
for (let i = 0; i < hocalar.length; i += PARTI) {
  const dilim = hocalar.slice(i, i + PARTI);
  const v = await embed(dilim.map((h) => (h.konular ?? []).join(", ") || h.ad), "document");
  for (const [k, h] of dilim.entries()) await db.update(akademisyen).set({ embedding: v[k] }).where(eq(akademisyen.id, h.id));
  console.log(`akademisyen ${i + dilim.length}/${hocalar.length}`);
}
process.exit(0);
