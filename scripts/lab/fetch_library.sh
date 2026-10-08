#!/usr/bin/env bash
# Download the encoded footage (public/lab/media/library/, git-ignored)
# from the Cloudflare preview, for machines without the owner's drive folder
# (e.g. a cloud session). The file list is scripts/lab/library-files.txt,
# written on the machine that ran encode_library.py. Usage:
#   scripts/lab/fetch_library.sh [base-url]
set -euo pipefail
BASE="${1:-https://sgs-rl-lab.mateogc.workers.dev}/lab/media/library"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/public/lab/media/library"
while read -r f; do
  [ -z "$f" ] && continue
  [ -s "$OUT/$f" ] && continue
  mkdir -p "$OUT/$(dirname "$f")"
  curl -fsS -o "$OUT/$f" "$BASE/$f" || echo "failed: $f" >&2
done < "$ROOT/scripts/lab/library-files.txt"
echo "done: $(find "$OUT" -type f | wc -l | tr -d ' ') files in $OUT"
