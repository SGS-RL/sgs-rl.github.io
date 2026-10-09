#!/usr/bin/env python3
"""Twitter thread video 2, overlaid: the plots over the waterproof render.

Usage (dev server running on port 3100):
    PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \\
    python3 scripts/lab/thread/sampling_overlay.py /path/to/mateo_sgs_learning_progress [o1 o5-alpha ...]

The owner asked for the plots inside the frame of the UR5e video
(2026-10-09), in a few versions (app/lab/thread/SamplingOverlay.tsx: o1
corners, o2 corners on panels, o3 left column on a panel, o5 left column).
"{v}-alpha" writes only the plots, on a transparent background, as
2-sampling-overlay-{v}-alpha.mov (ProRes 4444 with alpha, for Premiere).
Encodes the ledger's frames of raw_scene.mp4 whole, 1920 x 1080, every
frame a keyframe (public/media/library/thread/waterproof-1920.mp4,
git-ignored), steps /lab/thread/overlay/{v}/ frame by frame (frames.mjs)
and writes ~/Downloads/sgs-thread/2-sampling-overlay-{v}.mp4: 1920 x 1080,
30 fps, H.264 high, CRF 14, no audio. Requires ffmpeg, node and Chrome.
"""

import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..", "..")
SRC = os.path.join(ROOT, "public", "media", "library", "thread", "waterproof-1920.mp4")
OUT = os.path.expanduser("~/Downloads/sgs-thread")


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main():
    bundle, variants = sys.argv[1], sys.argv[2:] or ["o1", "o2", "o3", "o5"]
    data = os.path.join(bundle, "data", "waterproof")
    ledger = sorted(json.load(open(os.path.join(data, "FRAME_LEDGER.json"))), key=lambda r: r["output_frame"])
    frames = [r["source_render_frame"] for r in ledger]
    runs = []
    for f in frames:
        if runs and f == runs[-1][1] + 1:
            runs[-1][1] = f
        else:
            runs.append([f, f])
    pick = "+".join(f"between(n\\,{a}\\,{b})" for a, b in runs)
    os.makedirs(os.path.dirname(SRC), exist_ok=True)
    ff("-i", os.path.join(data, "raw_scene.mp4"), "-vf", f"select='{pick}',setpts=N/30/TB,setsar=1",
       "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "1",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", SRC)
    os.makedirs(OUT, exist_ok=True)
    for name in variants:
        v, alpha = name.removesuffix("-alpha"), name.endswith("-alpha")
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(["node", os.path.join(HERE, "frames.mjs"), f"/lab/thread/overlay/{v}/",
                            str(len(frames)), tmp, *(["alpha"] if alpha else [])], check=True)
            frames_in = ["-framerate", "30", "-i", os.path.join(tmp, "%05d.png")]
            if alpha:
                out = os.path.join(OUT, f"2-sampling-overlay-{v}-alpha.mov")
                ff(*frames_in, "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le",
                   "-alpha_bits", "16", "-vendor", "apl0", "-an", out)
            else:
                out = os.path.join(OUT, f"2-sampling-overlay-{v}.mp4")
                ff(*frames_in, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-crf", "14",
                   "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out)
        print("wrote", out, flush=True)


if __name__ == "__main__":
    main()
