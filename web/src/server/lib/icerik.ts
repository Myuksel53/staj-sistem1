import { createHash } from "node:crypto";

/** Sayfayı karşılaştırılabilir düz metne indirger (script/stil/etiket/boşluk temizlenir). */
export function metneIndirge(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr");
}

export const icerikHash = (html: string) => createHash("sha256").update(metneIndirge(html)).digest("hex");
