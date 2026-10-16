import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { kayitliArama } from "@/db/schema";
import { kullaniciId } from "@/server/middleware/rbac";
import { aramaSonuclari, type Kriterler } from "@/server/lib/radar";
import { aramaKaydet, aramaSil } from "./actions";

const alan = "w-full rounded border bg-transparent px-3 py-2";

async function Liste() {
  const aramalar = await db.select().from(kayitliArama).where(eq(kayitliArama.kullaniciId, await kullaniciId()));
  const sonuclar = await Promise.all(aramalar.map((a) => aramaSonuclari(a.kriterler as Kriterler)));
  return (
    <ul className="mt-8 flex flex-col gap-4">
      {aramalar.map((a, i) => (
        <li key={a.id} className="rounded border p-4">
          <div className="flex justify-between">
            <strong>{(a.kriterler as Kriterler).konu}</strong>
            <form action={aramaSil}><input type="hidden" name="id" value={a.id} /><button className="text-sm underline">Sil</button></form>
          </div>
          <p className="text-sm text-ink-mute">E-posta bildirimi: {a.bildirim ? "açık" : "kapalı"} · {sonuclar[i].length} güncel sonuç</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {sonuclar[i].slice(0, 5).map(({ f, kurumAdi }) => <li key={f.id}>{f.baslik} — {kurumAdi}</li>)}
          </ul>
        </li>
      ))}
    </ul>
  );
}


export default function Aramalar() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-4 text-2xl font-semibold">Kayıtlı aramalar</h1>
      <form action={aramaKaydet} className="flex flex-col gap-3">
        <input name="konu" required minLength={5} placeholder="Aradığın konu" className={alan} />
        <input name="sehir" placeholder="Şehir (isteğe bağlı)" className={alan} />
        <select name="uzaktan" defaultValue="farketmez" className={alan}>
          <option value="farketmez">Uzaktan: fark etmez</option><option value="evet">Yalnızca uzaktan</option><option value="hayir">Yalnızca yerinde</option>
        </select>
        <label className="flex gap-2"><input type="checkbox" name="bildirim" /> Yeni fırsat çıkınca e-posta gönder</label>
        <button className="self-start rounded border px-4 py-2">Kaydet</button>
      </form>
      <Suspense fallback={<p className="mt-8">Yükleniyor…</p>}><Liste /></Suspense>
    </main>
  );
}
