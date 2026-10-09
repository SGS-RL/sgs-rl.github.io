#!/usr/bin/env python3
"""Clips for the larger Results quilt videos (Twitter thread video 3, b-d).

Usage:
    python3 scripts/lab/thread/prep_quilt_clips.py [--force] [id ...]

Reads the clip ids of every version in app/lab/thread/quilt/versions.json
and writes, for each, public/media/library/thread/quilt/{id}.mp4 (the
library is git-ignored): at most 12 seconds of the library's 960 px file
(clips/ or runs/), 640 px wide, 30 fps, a keyframe every 10 frames and no
B-frames, so that the render's seek on every frame is quick. Clips longer
than 12 s keep their liveliest 12 s: the window with the most change from
frame to frame (each frame's change capped, so a cut or a reset does not
count for more than motion), past the first 5 s for runs of over 30 s (the
one-minute Franka run fades in from black). Shorter clips are kept whole
and loop in the render. Prints each clip's window. Requires ffmpeg.
"""

import json
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
LIB = os.path.join(ROOT, "public", "media", "library")
OUT = os.path.join(LIB, "thread", "quilt")
VERSIONS = os.path.join(ROOT, "app", "lab", "thread", "quilt", "versions.json")
WINDOW = 12.0


def source(ident):
    for d in ("clips", "runs"):
        p = os.path.join(LIB, d, f"{ident}.mp4")
        if os.path.exists(p):
            return p
    raise FileNotFoundError(ident)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True, check=True)
    return float(r.stdout)


def liveliest(path, earliest=0.0):
    """Start (s) of the 12 s window with the most frame-to-frame change."""
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf",
         "fps=10,scale=160:-2,signalstats,metadata=print:key=lavfi.signalstats.YDIF:file=-",
         "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    )
    d = [float(x) for x in re.findall(r"YDIF=([0-9.]+)", r.stdout)]
    if not d:
        return 0.0
    cap = 3 * sorted(d)[len(d) // 2] + 0.5
    d = [min(x, cap) for x in d]
    n = int(WINDOW * 10)
    best, start = -1.0, 0
    for k in range(int(earliest * 10), max(1, len(d) - n + 1), 5):
        s = sum(d[k:k + n])
        if s > best:
            best, start = s, k
    return start / 10


def main():
    force = "--force" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    os.makedirs(OUT, exist_ok=True)
    ids = []
    for v in json.load(open(VERSIONS)).values():
        ids += [c for c in v["clips"] if c not in ids]
    for ident in only or ids:
        out = os.path.join(OUT, f"{ident}.mp4")
        if os.path.exists(out) and not force:
            continue
        src = source(ident)
        dur = duration(src)
        start = liveliest(src, 5.0 if dur > 30 else 0.0) if dur > WINDOW + 0.5 else 0.0
        length = min(WINDOW, dur - start)
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.2f}", "-t", f"{length:.2f}", "-i", src,
             "-vf", "scale=640:-2,fps=30,setsar=1", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
             "-g", "10", "-bf", "0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out],
            check=True,
        )
        print(f"{ident:40s} {start:5.1f}-{start + length:5.1f} s of {dur:5.1f}", flush=True)


if __name__ == "__main__":
    main()
