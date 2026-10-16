#!/usr/bin/env bash
# OpenAlex günlük kotası sıfırlanana kadar bekler, sonra tüm Türkiye üniversitelerini içe aktarır ve embedding üretir.
# Kullanım (bilgisayar açık kalmalı): cd data && source .venv/bin/activate && nohup caffeinate -i bash scripts/kota_bekle_ve_calistir.sh > tum_iller.log 2>&1 &
set -u
cd "$(dirname "$0")/.."
echo "[$(date '+%F %T')] Kota denetleniyor…"
while true; do
  baslik=$(curl -s -m 30 -D - -o /dev/null "https://api.openalex.org/institutions?filter=country_code:TR&per-page=1" || true)
  kod=$(echo "$baslik" | head -1 | awk '{print $2}')
  if [ "$kod" = "200" ]; then break; fi
  bekle=$(echo "$baslik" | grep -i '^retry-after' | awk '{print $2}' | tr -d '\r')
  bekle=${bekle:-1800}
  [ "$bekle" -gt 3600 ] && bekle=3600   # en fazla 1 saatlik adımlarla yeniden bak
  echo "[$(date '+%F %T')] Kota kapalı (HTTP $kod); $bekle sn bekleniyor"
  sleep "$((bekle + 30))"
done
echo "[$(date '+%F %T')] Kota açık, içe aktarma başlıyor"
python scripts/tum_iller.py
kod=$?
if [ "$kod" -ne 0 ]; then
  echo "[$(date '+%F %T')] Aktarım tamamlanamadı (kod $kod); 15 dk sonra yeniden denenecek"
  sleep 900
  exec bash "$0"   # baştan: kotayı yeniden denetler, kaldığı yerden devam eder
fi
echo "[$(date '+%F %T')] BİTTİ"
