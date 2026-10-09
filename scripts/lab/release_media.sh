#!/usr/bin/env bash
# Publish the site's encoded footage as assets of a GitHub release, so the
# videos stay out of git (owner, 2026-10-09: free and hassle-free, on
# GitHub). Two kinds of asset:
#   sgs-media-library.tar  public/media/library/ without download/ (and
#       without thread/, the sources of the Twitter thread videos)
#       (the videos the pages play, about 70 MB); the deploy workflow
#       unpacks it into public/media/ before building
#   {id}.mp4  the 1080p downloads (public/media/library/download/),
#       which the site's Download buttons link to directly
# Usage: scripts/lab/release_media.sh [tag]   (default media-v1)
#   TAR_ONLY=1 scripts/lab/release_media.sh   replaces only the archive,
#   when only the videos the pages play changed (not the downloads)
# Re-running replaces the assets of the same tag. For new footage, encode
# it (encode_library.py, encode_downloads.py), run this, then re-run the
# deploy workflow. A new tag also needs MEDIA_TAG changed in
# .github/workflows/deploy.yml.
set -euo pipefail
TAG="${1:-media-v1}"
REPO="SGS-RL/sgs-rl.github.io"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LIB="$ROOT/public/media/library"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

COPYFILE_DISABLE=1 tar -C "$ROOT/public/media" \
  --exclude 'library/download' --exclude 'library/thread' --exclude '.DS_Store' \
  -cf "$TMP/sgs-media-library.tar" library
echo "library: $(du -h "$TMP/sgs-media-library.tar" | cut -f1)"

if ! gh release view "$TAG" -R "$REPO" >/dev/null 2>&1; then
  gh release create "$TAG" -R "$REPO" --title "Site media ($TAG)" \
    --latest=false --notes "The videos of https://sgs-rl.github.io, kept out
of git. sgs-media-library.tar is unpacked into the site when it is deployed
(.github/workflows/deploy.yml); each .mp4 is a 1080p download linked from
the site. Made by scripts/lab/release_media.sh."
fi
if [ -n "${TAR_ONLY:-}" ]; then
  gh release upload "$TAG" -R "$REPO" --clobber "$TMP/sgs-media-library.tar"
  echo "uploaded to $TAG: 1 archive"
  exit 0
fi
gh release upload "$TAG" -R "$REPO" --clobber \
  "$TMP/sgs-media-library.tar" "$LIB"/download/*.mp4
echo "uploaded to $TAG: 1 archive, $(ls "$LIB"/download/*.mp4 | wc -l | tr -d ' ') downloads"
