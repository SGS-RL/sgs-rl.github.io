#!/usr/bin/env python3
"""Twitter thread video 2: "Sampling during training", waterproof connector.

Usage (dev server running on port 3100):
    PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \\
    python3 scripts/lab/thread/sampling_video.py /path/to/mateo_sgs_learning_progress [out.mp4]

Method part 03's view of one task (owner, 2026-10-09: the waterproof
connector, with the plots in the video, to annotate in Premiere Pro):

1. Encodes the footage as the site does (encode_learning.py: the ledger's
   frames of raw_scene.mp4, cropped to x = 320..1600) but at full size,
   1280 x 1080, every frame a keyframe so seeking is exact:
   public/media/library/thread/waterproof-1280.mp4 (git-ignored).
2. Steps /lab/thread/sampling/ frame by frame in Chrome (frames.mjs) at
   1200 x 675 CSS px and 1.6x, so the chart's text is 21 px in the video.
3. Encodes the frames: 1920 x 1080, 30 fps, H.264 high, CRF 14, no audio.
Requires ffmpeg, node and Google Chrome.
"""

import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..", "..")
SRC = os.path.join(ROOT, "public", "media", "library", "thread", "waterproof-1280.mp4")


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main():
    bundle = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~/Downloads/sgs-thread/2-sampling-during-training.mp4")
    data = os.path.join(bundle, "data", "waterproof")
    ledger = sorted(json.load(open(os.path.join(data, "FRAME_LEDGER.json"))), key=lambda r: r["output_frame"])
    frames = [r["source_render_frame"] for r in ledger]
    # Runs of consecutive source frames, as encode_learning.py selects them.
    runs = []
    for f in frames:
        if runs and f == runs[-1][1] + 1:
            runs[-1][1] = f
        else:
            runs.append([f, f])
    pick = "+".join(f"between(n\\,{a}\\,{b})" for a, b in runs)
    os.makedirs(os.path.dirname(SRC), exist_ok=True)
    ff("-i", os.path.join(data, "raw_scene.mp4"), "-vf",
       f"select='{pick}',setpts=N/30/TB,crop=1280:1080:320:0,setsar=1",
       "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "1",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", SRC)

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["node", os.path.join(HERE, "frames.mjs"), "/lab/thread/sampling/", str(len(frames)), tmp],
            check=True,
        )
        ff("-framerate", "30", "-i", os.path.join(tmp, "%05d.png"),
           "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-crf", "14",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out)
    print("wrote", out)


if __name__ == "__main__":
    main()
