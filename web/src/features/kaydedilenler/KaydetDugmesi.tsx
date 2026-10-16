"use client";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { kaydetDegistirAction } from "./actions";

/** ☆ Kaydet / ★ Kaydedildi. Tıklayınca anında değişir (iyimser), sunucu arkadan kaydeder; hata olursa eski haline döner. Oturum yoksa giriş sayfasına gider. */
export function KaydetDugmesi({ firsatId, kayitli }: { firsatId: string; kayitli: boolean }) {
  const router = useRouter();
  const [bekliyor, basla] = useTransition();
  const [simdi, iyimser] = useOptimistic(kayitli, (_onceki, yeni: boolean) => yeni);
  const tikla = () =>
    basla(async () => {
      iyimser(!simdi);
      const s = await kaydetDegistirAction(firsatId);
      if (s.durum === "giris") router.push("/giris?hata=" + encodeURIComponent("Programı kaydetmek için giriş yap ya da hesap aç."));
      else router.refresh();
    });
  return (
    <button type="button" onClick={tikla} disabled={bekliyor} aria-pressed={simdi}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-70 ${simdi ? "border-primary bg-primary-tint text-primary-ink" : "border-line bg-surface text-ink-soft hover:border-primary/50 hover:text-ink"}`}>
      {simdi ? "★ Kaydedildi" : "☆ Kaydet"}
    </button>
  );
}
