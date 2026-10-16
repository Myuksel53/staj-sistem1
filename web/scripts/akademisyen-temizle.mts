// Kullanım: npm run akademisyen:temizle [-- --uygula]
// Konu etiketleri yalnızca tıp/gıda/biyoloji olan (mühendislik etiketi hiç olmayan) akademisyenleri bulur. Varsayılan: sadece listeler.
// Kullanıcı verisine (başvuru, eşleşme) bağlı olanlar silinmez. Kalan alakasızlar yeni içe aktarıcının alan süzgeciyle temizlenir.
import postgres from "postgres";

const TIP = /(surg|cancer|clinic|patient|disease|therap|medic|health|dental|nurs|pharma|cardi|diabet|tumor|pediatr|oncolog|infect|vaccin|obstet|gyne|psychiat|anatom|genetic|protein|bacteri|virus|covid|pregnan|stroke|hepat|renal|kidney|orthop|ophthal|dermat|radiolog|forensic|agricult|plant|soil|crop|food|veterin|livestock|fish|ocular|corneal)/i;
const MUH = /(comput|network|engineer|circuit|signal|software|robot|algorithm|security|electronic|communicat|embedded|vision|wireless|antenna|control|sensor|machine learning|deep learning|neural|data|internet|blockchain|crypt|optimi|fpga|image|speech|language processing|recognition|localization)/i;

const uygula = process.argv.includes("--uygula");
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const satir = await sql`select a.id, a.ad, k.ad as kurum, a.konular from akademisyen a join kurum k on k.id = a.kurum_id`;
const aday = satir.filter((a) => {
  const t = (a.konular ?? []) as string[];
  return t.filter((x) => TIP.test(x)).length >= 2 && t.filter((x) => MUH.test(x)).length === 0;
});
const bagli = new Set((await sql`select akademisyen_id as id from basvuru where akademisyen_id is not null union select akademisyen_id from eslesme where akademisyen_id is not null`).map((r) => r.id));
const silinecek = aday.filter((a) => !bagli.has(a.id));
console.log(`toplam ${satir.length} | alakasız aday ${aday.length} | kullanıcı verisine bağlı (silinmez) ${aday.length - silinecek.length}`);
for (const a of silinecek.slice(0, 8)) console.log(" -", a.ad, "|", a.kurum, "|", ((a.konular ?? []) as string[]).slice(0, 2).join("; "));
if (uygula && silinecek.length) {
  const ids = silinecek.map((a) => a.id);
  await sql`delete from yayin where akademisyen_id = any(${ids})`;
  await sql`delete from dogrulama where varlik_turu = 'akademisyen' and varlik_id = any(${ids})`;
  await sql`delete from akademisyen where id = any(${ids})`;
  console.log(`silindi: ${ids.length}`);
} else if (!uygula) console.log("Silmek için: npm run akademisyen:temizle -- --uygula");
await sql.end();
process.exit(0);
