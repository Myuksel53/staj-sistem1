/** robots.txt: verilen user-agent (yoksa *) grubunda en uzun eşleşen Allow/Disallow kuralı kazanır. Boş Disallow = izin. */
export function robotsIzinVerir(robotsTxt: string, yol: string, userAgent: string): boolean {
  type Grup = { agents: string[]; kurallar: { izin: boolean; yol: string }[] };
  const gruplar: Grup[] = [];
  let son: Grup | null = null;
  let oncekiAgent = false;
  for (const ham of robotsTxt.split(/\r?\n/)) {
    const satir = ham.split("#")[0].trim();
    const i = satir.indexOf(":");
    if (i < 0) continue;
    const anahtar = satir.slice(0, i).trim().toLowerCase();
    const deger = satir.slice(i + 1).trim();
    if (anahtar === "user-agent") {
      if (!oncekiAgent || !son) { son = { agents: [], kurallar: [] }; gruplar.push(son); }
      son.agents.push(deger.toLowerCase());
      oncekiAgent = true;
    } else {
      oncekiAgent = false;
      if (son && (anahtar === "allow" || anahtar === "disallow") && deger !== "") {
        son.kurallar.push({ izin: anahtar === "allow", yol: deger });
      }
    }
  }
  const ua = userAgent.toLowerCase();
  const ozel = gruplar.filter((g) => g.agents.some((a) => a !== "*" && ua.includes(a)));
  const secilen = ozel.length ? ozel : gruplar.filter((g) => g.agents.includes("*"));
  let en: { izin: boolean; uzunluk: number } | null = null;
  for (const g of secilen) {
    for (const k of g.kurallar) {
      const kalip = k.yol.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
      if (new RegExp("^" + kalip).test(yol) && (!en || k.yol.length > en.uzunluk || (k.yol.length === en.uzunluk && k.izin))) {
        en = { izin: k.izin, uzunluk: k.yol.length };
      }
    }
  }
  return en ? en.izin : true;
}
