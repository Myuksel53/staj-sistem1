"""turkiye_universiteleri.json içindeki üniversiteleri sırayla içe aktarır. Kaldığı yerden devam eder, kota bitince durur.

Sıra: önce her ilin en büyük üniversitesi (81 ile mümkün olduğunca erken yayılmak için), sonra kalanlar.
Kullanım: cd data && source .venv/bin/activate && python scripts/tum_iller.py [--sinir 40]
Durum dosyası: data/.ice_aktarilan.json (silersen baştan yapar).
"""
import argparse, json, os, subprocess, sys

KOK = os.path.join(os.path.dirname(__file__), "..")
LISTE = os.path.join(KOK, "turkiye_universiteleri.json")
DURUM = os.path.join(KOK, ".ice_aktarilan.json")


def sirala(kurumlar):
    gorulen, ilk, geri = set(), [], []
    for k in sorted(kurumlar, key=lambda x: -x["yayin"]):
        (geri if k["sehir"] in gorulen else ilk).append(k)
        gorulen.add(k["sehir"])
    return ilk + geri


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sinir", type=int, default=0, help="Bu çalıştırmada en fazla kaç üniversite (0 = hepsi)")
    a = ap.parse_args()
    if not os.path.exists(LISTE):  # liste yoksa önce OpenAlex'ten üret
        r = subprocess.run([sys.executable, os.path.join(KOK, "scripts", "turkiye_universiteleri.py")])
        if r.returncode != 0:
            sys.exit("Üniversite listesi üretilemedi (OpenAlex kotası bitmiş olabilir).")
    kurumlar = [k for k in json.load(open(LISTE, encoding="utf-8")) if k["sehir"]]
    yapilan = set(json.load(open(DURUM))) if os.path.exists(DURUM) else set()
    bekleyen = [k for k in sirala(kurumlar) if k["openalex_id"] not in yapilan]
    print(f"{len(kurumlar)} üniversite, {len(yapilan)} yapıldı, {len(bekleyen)} bekliyor")
    for n, k in enumerate(bekleyen, 1):
        if a.sinir and n > a.sinir:
            break
        r = subprocess.run([sys.executable, os.path.join(KOK, "scripts", "openalex_import.py"), "--kurum-id", k["openalex_id"], "--ad", k["ad"], "--sehir", k["sehir"]],
                           capture_output=True, text=True)
        cikti = (r.stdout + r.stderr).strip().splitlines()
        print(f"[{n}/{len(bekleyen)}]", cikti[-1] if cikti else r.returncode)
        if r.returncode == 75:
            print("Kota bitti, durdum. Yarın ya da anahtarla aynı komutu yeniden çalıştır; kaldığı yerden devam eder.")
            break
        if r.returncode == 0:
            yapilan.add(k["openalex_id"])
            json.dump(sorted(yapilan), open(DURUM, "w"))
    # Embedding'siz yayın aramada görünmez: içe aktarmadan sonra mutlaka üret.
    print("Embedding üretiliyor (npm run embed)…")
    subprocess.run(["npm", "run", "embed"], cwd=os.path.join(KOK, "..", "web"))


if __name__ == "__main__":
    main()
