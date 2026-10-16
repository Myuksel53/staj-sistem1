"""OpenAlex'ten bir üniversitenin bilgisayar/elektronik alanındaki akademisyenlerini ve yayınlarını çeker, Postgres'e yazar.

Kullanım:
  python scripts/openalex_import.py --kurum-id https://openalex.org/I51826884 --ad "Kocaeli Üniversitesi" --sehir Kocaeli
  python scripts/openalex_import.py --kurum "Orta Doğu Teknik Üniversitesi" --sehir Ankara       (adla arar)
  python scripts/tum_iller.py                                                                      (listedeki tüm üniversiteler)

İlke ve neden:
- Yalnızca ana konusu Bilgisayar Bilimi (17) ya da Mühendislik (22) olan, DOI'si ve özeti bulunan yayınlar alınır; böylece tıp/gıda gibi
  alanlardaki yazarlar listeye girmez.
- Üniversite başına yalnızca 3 istek yapılır (50'şer yayın, atıfa göre). Akademisyenler bu yayınların yazarlarından, yayın sayısına göre seçilir;
  yayınları ayrı istekle çekilmez. Ücretsiz günlük OpenAlex kotası (anahtarsız ~1000 istek) bu yüzden ~300 üniversiteye yeter.
- Kota bitince 429 yanıtı beklenmez, `KotaBitti` ile durulur (tum_iller.py kaldığı yerden devam eder).
- OPENALEX_API_KEY (web/.env.local) varsa kullanılır; ücretsiz anahtar daha büyük bir kota verir.
- Kurumun eski akademisyenleri (kullanıcı verisine bağlı olmayanlar) önce silinip yeniden yazılır. Embedding üretilmez: sonra `npm run embed`.
"""
import argparse, collections, os, re, sys, time
import httpx, psycopg
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "web", ".env.local"))
API = "https://api.openalex.org"
ALANLAR = "17|22"  # Computer Science | Engineering
ANAHTAR = os.environ.get("OPENALEX_API_KEY", "")
BASLIK = {"Authorization": f"Bearer {ANAHTAR}"} if ANAHTAR else {}
MAIL = {"mailto": os.environ["OPENALEX_MAILTO"]} if os.environ.get("OPENALEX_MAILTO") else {}
SAYFA, SAYFA_BOYU = 3, 50


class KotaBitti(Exception):
    pass


def get(client, path, **params):
    for deneme in range(4):
        time.sleep(0.4)
        r = client.get(f"{API}{path}", params={**MAIL, **params}, headers=BASLIK, timeout=40)
        if r.status_code == 429:
            govde = r.text
            if "budget" in govde.lower() or int(r.headers.get("retry-after", "0") or 0) > 600:
                raise KotaBitti(f"OpenAlex günlük kotası bitti; {int(r.headers.get('retry-after', '0') or 0) // 3600} saat sonra sıfırlanır. "
                                "Ücretsiz anahtar: https://help.openalex.org/api/authentication/ (web/.env.local içine OPENALEX_API_KEY)")
            time.sleep(3 * (deneme + 1))
            continue
        r.raise_for_status()
        return r.json()
    raise KotaBitti("OpenAlex sürekli 429 veriyor")


def abstract_metni(inv):
    if not inv:
        return None
    kelimeler = {}
    for kelime, konumlar in inv.items():
        for k in konumlar:
            kelimeler[k] = kelime
    return " ".join(kelimeler[k] for k in sorted(kelimeler))


def turkcelestir(ad: str) -> str:
    """OpenAlex adlarını (çoğu İngilizce) arayüz için okunur Türkçeye yaklaştırır; kesin çeviri değildir."""
    ad = re.sub(r"(?i)\bTechnical University\b", "Teknik Üniversitesi", ad)
    m = re.match(r"^(.*)\s+University$", ad)
    if m:
        return f"{m.group(1)} Üniversitesi"
    return ad.replace(" Institute of Technology", " Teknoloji Enstitüsü")


def kurum_bul(client, ad):
    for aday in dict.fromkeys([ad, ad.replace("Üniversitesi", "University").replace("Teknik", "Technical").replace("Enstitüsü", "Institute")]):
        sonuc = get(client, "/institutions", search=aday, **{"per-page": 1})["results"]
        if sonuc:
            return sonuc[0]
    sys.exit("Kurum bulunamadı")


def calisma_cek(client, kurum_id):
    """Kurumun alan süzgecinden geçen en çok atıf alan ~150 yayınını getirir."""
    temel = f"authorships.institutions.id:{kurum_id},has_doi:true,has_abstract:true"
    for filtre in (f"{temel},primary_topic.field.id:{ALANLAR}", temel):  # alan süzgeci reddedilirse (400) süzgeçsiz dener
        eserler = []
        try:
            for sayfa in range(1, SAYFA + 1):
                j = get(client, "/works", filter=filtre, sort="cited_by_count:desc", page=sayfa,
                        select="id,doi,title,publication_year,authorships,abstract_inverted_index,topics",
                        **{"per-page": SAYFA_BOYU})
                eserler += j["results"]
                if len(j["results"]) < SAYFA_BOYU:
                    break
            return eserler, "primary_topic.field" in filtre
        except httpx.HTTPStatusError as e:
            if e.response.status_code != 400:
                raise
            print("  ! alan süzgeci reddedildi (400), süzgeçsiz deneniyor", file=sys.stderr)
    return [], False


def islem(client, db, kurum_id, ad, sehir, adet):
    eserler, suzgecli = calisma_cek(client, kurum_id)
    yazarlar = {}
    for w in eserler:
        for au in w.get("authorships", []):
            aid = au["author"].get("id")
            if not aid or not any(i["id"] == kurum_id for i in au.get("institutions", [])):
                continue
            y = yazarlar.setdefault(aid, {"ad": au["author"]["display_name"], "orcid": au["author"].get("orcid"), "eserler": [], "konular": collections.Counter()})
            y["eserler"].append(w)
            for t in w.get("topics", [])[:3]:
                y["konular"][t["display_name"]] += 1
    secilen = sorted(yazarlar.items(), key=lambda kv: -len(kv[1]["eserler"]))[:adet]

    with db.cursor() as cur:
        cur.execute("select id from kurum where openalex_id = %s", (kurum_id,))
        satir = cur.fetchone()
        if not satir:
            cur.execute("select id from kurum where ad = %s", (ad,))
            satir = cur.fetchone()
        if satir:
            kid = satir[0]
            cur.execute("update kurum set openalex_id = %s, sehir = coalesce(%s, sehir) where id = %s", (kurum_id, sehir, kid))
        else:
            cur.execute("insert into kurum (ad, tur, sehir, ulke, openalex_id) values (%s,'universite',%s,'TR',%s) returning id", (ad, sehir, kurum_id))
            kid = cur.fetchone()[0]
        # Eski kayıtları temizle (kullanıcı verisine bağlı olmayanları): yeniden yazılacak
        cur.execute("""select a.id from akademisyen a where a.kurum_id = %s
                       and not exists (select 1 from basvuru b where b.akademisyen_id = a.id)
                       and not exists (select 1 from eslesme e where e.akademisyen_id = a.id)""", (kid,))
        eski = [r[0] for r in cur.fetchall()]
        if eski:
            cur.execute("delete from yayin where akademisyen_id = any(%s)", (eski,))
            cur.execute("delete from dogrulama where varlik_turu = 'akademisyen' and varlik_id = any(%s)", (eski,))
            cur.execute("delete from akademisyen where id = any(%s)", (eski,))

        yazilan = 0
        for aid, y in secilen:
            konular = [k for k, _ in y["konular"].most_common(5)]
            cur.execute("""insert into kaynak (url, tur, son_getirilme) values (%s,'yayin_veritabani', now())
                           on conflict (url) do update set son_getirilme = now() returning id""", (aid,))
            kaynak_id = cur.fetchone()[0]
            cur.execute("""insert into akademisyen (ad, kurum_id, konular, orcid, openalex_id) values (%s,%s,%s,%s,%s)
                           on conflict (openalex_id) do update set konular = excluded.konular, kurum_id = excluded.kurum_id, ad = excluded.ad
                           returning id""", (y["ad"], kid, konular, y["orcid"], aid))
            ak_id = cur.fetchone()[0]
            cur.execute("""insert into dogrulama (varlik_turu, varlik_id, alan, deger, kaynak_id, yontem)
                           values ('akademisyen',%s,'konular',%s,%s,'otomatik')""", (ak_id, ", ".join(konular), kaynak_id))
            for w in y["eserler"][:6]:
                ozet = abstract_metni(w.get("abstract_inverted_index"))
                if not w.get("doi") or not ozet:
                    continue
                cur.execute("""insert into yayin (akademisyen_id, baslik, yil, yazarlar, ozet, konu_etiketleri, doi)
                               values (%s,%s,%s,%s,%s,%s,%s) on conflict (doi) do nothing""",
                            (ak_id, w["title"], w.get("publication_year"), [x["author"]["display_name"] for x in w.get("authorships", [])],
                             ozet, [t["display_name"] for t in w.get("topics", [])[:5]], w["doi"]))
            yazilan += 1
    db.commit()
    return len(eserler), yazilan, suzgecli


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--kurum", help="Kurum adı (OpenAlex'te aranır)")
    g.add_argument("--kurum-id", help="OpenAlex kurum kimliği (https://openalex.org/I…)")
    ap.add_argument("--ad", help="Veritabanında görünecek ad (varsayılan: OpenAlex adı, Türkçeleştirilmiş)")
    ap.add_argument("--sehir", default=None)
    ap.add_argument("--adet", type=int, default=12, help="Üniversite başına en fazla akademisyen")
    a = ap.parse_args()
    with httpx.Client() as c, psycopg.connect(os.environ["DATABASE_URL"], prepare_threshold=None) as db:
        if a.kurum_id:
            kid, ad = a.kurum_id, a.ad or a.kurum_id
        else:
            k = kurum_bul(c, a.kurum)
            kid, ad = k["id"], a.ad or a.kurum
        if not a.ad and a.kurum_id:
            ad = a.kurum_id
        calisma, yazilan, suzgecli = islem(c, db, kid, ad, a.sehir, a.adet)
        print(f"{ad} ({a.sehir}): {calisma} yayın tarandı, {yazilan} akademisyen yazıldı{'' if suzgecli else ' [alan süzgeci KULLANILAMADI]'}")


if __name__ == "__main__":
    try:
        main()
    except KotaBitti as e:
        print(f"KOTA: {e}")
        sys.exit(75)
