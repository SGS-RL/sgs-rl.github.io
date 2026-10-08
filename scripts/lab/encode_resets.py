#!/usr/bin/env python3
"""Encode the Franka reset-strategy videos for Method part 02.

Usage:
    python3 scripts/lab/encode_resets.py [/path/to/franka_reset_tour_4k] [--force]

The owner's folder (2026-10-08) holds one 4K render per reset strategy of
the Franka nut-and-bolt task, each 20 task configurations held for one
second: spawn0 is Reaching, spawn2 Stable Grasp, spawn1 Near-Goal (the
paper's names, appendix A.2). reset_tour.mp4 is not used.

Writes public/lab/media/library/resets/{reaching,stable-grasp,near-goal}.mp4
and .jpg posters: cropped closer (2880 x 1620 of 3840 x 2160, the robot,
nut and board stay in frame for every configuration), 1600 px wide, H.264,
25 fps as rendered, real time, no audio. Requires ffmpeg.
"""

import argparse
import os
import subprocess

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "lab", "media", "library", "resets")
SOURCES = [
    ("spawn0_wide.mp4", "reaching"),
    ("spawn2_wide.mp4", "stable-grasp"),
    ("spawn1_wide.mp4", "near-goal"),
]
VF = "crop=2880:1620:480:60,scale=1600:-2,setsar=1"
X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"]


def run(cmd):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *cmd], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", nargs="?", default=os.path.expanduser("~/Downloads/franka_reset_tour_4k"))
    ap.add_argument("--force", action="store_true")
    o = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    for src, ident in SOURCES:
        mp4 = os.path.join(OUT, f"{ident}.mp4")
        jpg = os.path.join(OUT, f"{ident}.jpg")
        if os.path.exists(mp4) and not o.force:
            print("skip", ident)
            continue
        path = os.path.join(o.root, src)
        # A keyframe at every configuration (one per second at 25 fps).
        run(["-i", path, "-vf", VF, "-r", "25", "-g", "25", *X264, mp4])
        # Poster: the first configuration, mid-hold.
        run(["-ss", "0.5", "-i", mp4, "-frames:v", "1", "-q:v", "4", jpg])
        print("ok  ", ident, f"{os.path.getsize(mp4) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
