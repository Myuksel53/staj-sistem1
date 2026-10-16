import { hataBildir } from "@/features/hata-bildir/actions";

export function HataBildir({ varlikTuru, varlikId }: { varlikTuru: "firsat" | "grup" | "akademisyen"; varlikId: string }) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-ink-mute">Bu bilgi yanlış</summary>
      <form action={hataBildir} className="mt-2 flex flex-col gap-2">
        <input type="hidden" name="varlikTuru" value={varlikTuru} />
        <input type="hidden" name="varlikId" value={varlikId} />
        <textarea name="aciklama" required minLength={10} rows={2} placeholder="Neyin yanlış olduğunu yaz (ör. ilan kapanmış)"
          className="w-full rounded border bg-transparent p-2" />
        <button className="self-start rounded border px-2">Bildir</button>
      </form>
    </details>
  );
}
