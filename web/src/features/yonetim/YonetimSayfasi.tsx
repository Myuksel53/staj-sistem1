import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { kaynak, kontrolKuyrugu } from "@/db/schema";
import { adminZorunlu } from "@/server/middleware/rbac";
import { kuyrukCoz } from "./actions";

const SONUCLAR = ["degisiklik_yok", "acik", "kapali", "bilinmiyor", "kabul_ediyor", "kabul_etmiyor", "gecersiz"];

async function Kuyruk() {
  await adminZorunlu();
  const satirlar = await db
    .select({ k: kontrolKuyrugu, url: kaynak.url })
    .from(kontrolKuyrugu)
    .leftJoin(kaynak, eq(kaynak.id, kontrolKuyrugu.kaynakId))
    .where(eq(kontrolKuyrugu.durum, "bekliyor"))
    .orderBy(asc(kontrolKuyrugu.olusturma));
  return (
    <ul className="flex flex-col gap-3">
      {satirlar.map(({ k, url }) => (
        <li key={k.id} className="rounded border p-3 text-sm">
          <div><strong>{k.varlikTuru}</strong> · {k.neden.replace("_", " ")} · {k.olusturma.toLocaleDateString("tr-TR")}</div>
          {k.not && <p className="mt-1">“{k.not}”</p>}
          {url && <a href={url} className="underline" rel="noopener noreferrer">Kaynak sayfa</a>}
          <form action={kuyrukCoz} className="mt-2 flex gap-2">
            <input type="hidden" name="id" value={k.id} />
            <select name="sonuc" className="rounded border bg-transparent px-2 py-1">
              {SONUCLAR.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <button className="rounded border px-2">Çöz</button>
          </form>
        </li>
      ))}
      {satirlar.length === 0 && <li className="text-ink-mute">Bekleyen kayıt yok.</li>}
    </ul>
  );
}


export default function Yonetim() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Kontrol kuyruğu</h1>
      <Suspense fallback={<p>Yükleniyor…</p>}><Kuyruk /></Suspense>
    </main>
  );
}
