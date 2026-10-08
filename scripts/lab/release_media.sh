#!/usr/bin/env bash
# Publish the site's encoded footage as assets of a GitHub release, so the
# videos stay out of git (owner, 2026-10-09: free and hassle-free, on
# GitHub). Two kinds of asset:
#   sgs-media-library.tar  public/lab/media/library/ without download/
#       (the videos the pages play, about 70 MB); the deploy workflow
#       unpacks it into public/lab/media/ before building
#   {id}.mp4  the 1080p downloads (public/lab/media/library/download/),
#       which the site's Download buttons link to directly
# Usage: scripts/lab/release_media.sh [tag]   (default media-v1)
# Re-running replaces the assets of the same tag. For new footage, encode
# it (encode_library.py, encode_downloads.py), run this, then re-run the
# deploy workflow. A new tag also needs MEDIA_TAG changed in
# .github/workflows/deploy.yml.
set -euo pipefail
TAG="${1:-media-v1}"
REPO="SGS-RL/sgs-rl.github.io"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LIB="$ROOT/public/lab/media/library"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

COPYFILE_DISABLE=1 tar -C "$ROOT/public/lab/media" \
  --exclude 'library/download' --exclude '.DS_Store' \
  -cf "$TMP/sgs-media-library.tar" library
echo "library: $(du -h "$TMP/sgs-media-library.tar" | cut -f1)"

if ! gh release view "$TAG" -R "$REPO" >/dev/null 2>&1; then
  gh release create "$TAG" -R "$REPO" --title "Site media ($TAG)" \
    --latest=false --notes "The videos of https://sgs-rl.github.io, kept out
of git. sgs-media-library.tar is unpacked into the site when it is deployed
(.github/workflows/deploy.yml); each .mp4 is a 1080p download linked from
the site. Made by scripts/lab/release_media.sh."
fi
gh release upload "$TAG" -R "$REPO" --clobber \
  "$TMP/sgs-media-library.tar" "$LIB"/download/*.mp4
echo "uploaded to $TAG: 1 archive, $(ls "$LIB"/download/*.mp4 | wc -l | tr -d ' ') downloads"
