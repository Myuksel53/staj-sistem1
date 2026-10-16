const kac = (s: string) => s.replace(/\\/g, "\\\\").replace(/[;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");

export type IcsGirdi = { id: string; baslik: string; kurumAdi: string; sonBasvuru: string; kaynakUrl?: string | null };

const damgaOlustur = (simdi: Date) => simdi.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

/** Tek bir son başvuru gününü tüm gün olayı olarak yazar. `alarmGunleri`: kaç gün önce hatırlatılsın (takvim uygulaması kendisi hatırlatır). */
function olay(g: IcsGirdi, simdi: Date, alarmGunleri: number[]): string[] {
  const gun = g.sonBasvuru.replaceAll("-", "");
  const sonraki = new Date(`${g.sonBasvuru}T00:00:00Z`);
  sonraki.setUTCDate(sonraki.getUTCDate() + 1);
  const bitis = sonraki.toISOString().slice(0, 10).replaceAll("-", "");
  return [
    "BEGIN:VEVENT",
    `UID:${g.id}@calismanin-yolu`, `DTSTAMP:${damgaOlustur(simdi)}`,
    `DTSTART;VALUE=DATE:${gun}`, `DTEND;VALUE=DATE:${bitis}`,
    `SUMMARY:${kac(`Son başvuru: ${g.baslik}`)}`,
    `DESCRIPTION:${kac(`${g.kurumAdi}. Tarihi başvurmadan önce resmî sayfadan doğrula.${g.kaynakUrl ? ` Kaynak: ${g.kaynakUrl}` : ""}`)}`,
    ...(g.kaynakUrl ? [`URL:${g.kaynakUrl}`] : []),
    ...alarmGunleri.flatMap((n) => ["BEGIN:VALARM", `TRIGGER:-P${n}D`, "ACTION:DISPLAY", `DESCRIPTION:Son başvuruya ${n} gün kaldı`, "END:VALARM"]),
    "END:VEVENT",
  ];
}

/** Tek olaylık dosya (“Takvime ekle” düğmesi). */
export function icsOlustur(g: IcsGirdi, simdi = new Date()): string {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Calismanin Yolu//TR", ...olay(g, simdi, [3]), "END:VCALENDAR"].join("\r\n");
}

/** Abone olunabilir takvim: çok olay, 7 gün ve 1 gün önce hatırlatma. Takvim uygulaması adresi düzenli yeniler; yeni/değişen tarih kendiliğinden gelir. */
export function icsTakvim(girdiler: IcsGirdi[], ad: string, simdi = new Date()): string {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Calismanin Yolu//TR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${kac(ad)}`, "X-WR-TIMEZONE:Europe/Istanbul", "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H",
    ...girdiler.flatMap((g) => olay(g, simdi, [7, 1])),
    "END:VCALENDAR",
  ].join("\r\n");
}

