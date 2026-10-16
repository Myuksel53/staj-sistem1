"""OpenAlex'ten Türkiye'deki üniversiteleri çekip 81 ile eşler: data/turkiye_universiteleri.json

Kullanım: python scripts/turkiye_universiteleri.py
- Şehir adları OpenAlex'te tutarsızdır (Istanbul, İzmit, Adapazarı, "Tokat Province"…). ASCII'ye indirgenip il adıyla eşlenir;
  ilçe/şehir takma adları aşağıdaki tabloyla ile çevrilir. Eşlenemeyenler `sehir: null` kalır ve ekrana yazılır (elle bakılmalı).
"""
import json, os, re, time
import httpx

IL = ["Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkâri","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"]
assert len(IL) == 81

def katla(s: str) -> str:
    tablo = str.maketrans("ÇĞİIÖŞÜçğıöşüâîûÂÎÛ", "CGIIOSUcgiosuaiuAIU")
    return re.sub(r"[^a-z]", "", s.translate(tablo).lower())

IL_ANAHTAR = {katla(i): i for i in IL}
# İlçe veya eski/alternatif adlar → il
TAKMA = {"izmit": "Kocaeli", "gebze": "Kocaeli", "adapazari": "Sakarya", "alanya": "Antalya", "antakya": "Hatay", "iskenderun": "Hatay",
         "cankaya": "Ankara", "besiktas": "İstanbul", "sariyer": "İstanbul", "kadikoy": "İstanbul", "uskudar": "İstanbul", "beykoz": "İstanbul",
         "tuzla": "İstanbul", "pendik": "İstanbul", "maltepe": "İstanbul", "kartal": "İstanbul", "atasehir": "İstanbul", "sisli": "İstanbul",
         "bornova": "İzmir", "urla": "İzmir", "karsiyaka": "İzmir", "cigli": "İzmir", "selcuklu": "Konya", "melikgazi": "Kayseri",
         "tarsus": "Mersin", "ereğli": "Zonguldak", "eregli": "Zonguldak", "nilufer": "Bursa", "osmangazi": "Bursa", "mustafakemalpasa": "Bursa",
         "kirklareli": "Kırklareli", "afyon": "Afyonkarahisar", "maras": "Kahramanmaraş", "urfa": "Şanlıurfa", "antep": "Gaziantep"}

def ile_cevir(ham: str | None, bolge: str | None) -> str | None:
    for aday in (ham, bolge):
        if not aday: continue
        k = katla(re.sub(r"(?i)\b(province|il|ili)\b", "", aday))
        if k in IL_ANAHTAR: return IL_ANAHTAR[k]
        if k in TAKMA: return TAKMA[k]
    return None

def main():
    kayitlar = []
    with httpx.Client(timeout=40) as c:
        for sayfa in range(1, 12):
            for deneme in range(8):  # 429'da artan bekleme
                r = c.get("https://api.openalex.org/institutions", params={"filter": "country_code:TR,type:education", "per-page": 100, "page": sayfa,
                          "select": "id,display_name,geo,works_count,homepage_url"})
                if r.status_code != 429: break
                time.sleep(5 * (deneme + 1))
            r.raise_for_status()
            sonuc = r.json()["results"]
            if not sonuc: break
            kayitlar += sonuc
            time.sleep(0.5)
    cikti, eslesmeyen = [], []
    for k in kayitlar:
        ad = k["display_name"]
        # Okul/kolej gibi üniversite olmayanları ve çok az yayını olanları ele
        if not re.search(r"(?i)üni|uni|enstit|institute|akademi|academy|college|polytechn", ad) or k["works_count"] < 150:
            continue
        sehir = ile_cevir(k["geo"].get("city"), k["geo"].get("region"))
        if not sehir: eslesmeyen.append((ad, k["geo"].get("city")))
        cikti.append({"openalex_id": k["id"], "ad": ad, "sehir": sehir, "yayin": k["works_count"], "web": k.get("homepage_url")})
    cikti.sort(key=lambda x: -x["yayin"])
    yol = os.path.join(os.path.dirname(__file__), "..", "turkiye_universiteleri.json")
    json.dump(cikti, open(yol, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    iller = {x["sehir"] for x in cikti if x["sehir"]}
    print(f"{len(cikti)} üniversite, {len(iller)} il. Eşlenemeyen {len(eslesmeyen)}:")
    for ad, sh in eslesmeyen: print("  ?", ad, "|", sh)
    print("Üniversitesi olmayan iller:", ", ".join(i for i in IL if i not in iller))

if __name__ == "__main__":
    main()
