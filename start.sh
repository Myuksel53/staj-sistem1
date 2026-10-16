#!/usr/bin/env bash
# Geliştirme sunucusunu başlatır: ./start.sh
set -euo pipefail
cd "$(dirname "$0")/web"
[ -d node_modules ] || npm install
[ -f .env.local ] || { echo "web/.env.local yok. web/.env.example dosyasını kopyalayıp doldur."; exit 1; }
exec npm run dev
