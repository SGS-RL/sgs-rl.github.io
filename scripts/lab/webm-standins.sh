#!/usr/bin/env bash
# Playwright's headless Chromium cannot decode H.264, so pages with video
# screenshot as blank posters. This makes VP9 stand-ins for every MP4 under
# public/lab/media and copies them to out/__webm/, where shoot.mjs finds
# them. Transcodes are cached, so re-run it after every `npm run build`
# (the build wipes out/). Test-only: nothing here is committed or deployed.
set -euo pipefail
cd "$(dirname "$0")/../.."

cache=node_modules/.cache/lab-webm
mkdir -p "$cache" out/__webm
find public/lab/media -name '*.mp4' | while read -r f; do
  rel=${f#public/}
  name="${rel//\//_}.webm"
  if [ ! -s "$cache/$name" ]; then
    ffmpeg -nostdin -v error -y -i "$f" -c:v libvpx-vp9 -b:v 600k -g 8 \
      -deadline realtime -cpu-used 8 -an "$cache/$name"
  fi
  cp "$cache/$name" "out/__webm/$name"
done
echo "stand-ins ready in out/__webm"
