#!/usr/bin/env python3
"""Twitter thread video 1: task configurations of each reset strategy.

Usage:
    python3 scripts/lab/thread/reset_configs.py [/path/to/franka_reset_tour_4k] [out.mp4]

The owner's renders (2026-10-08) hold 20 task configurations of the Franka
nut on bolt per strategy, one second each at 25 fps (a new configuration on
every 25th frame). This cuts three per strategy, Near-Goal, then Stable
Grasp, then Reaching (owner, 2026-10-09), each held its full second, with
no labels: 9 seconds. Framing as on the site (2880 x 1620 of the 4K render),
at 1920 x 1080, 25 fps, H.264 high, CRF 14, no audio. Requires ffmpeg.
"""

import os
import subprocess
import sys

# (render, configurations): picked for different arm poses and positions.
PICKS = [
    ("spawn1_wide.mp4", [0, 6, 14]),  # Near-Goal
    ("spawn2_wide.mp4", [0, 7, 18]),  # Stable Grasp
    ("spawn0_wide.mp4", [0, 3, 11]),  # Reaching
]
FPS = 25


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Downloads/franka_reset_tour_4k")
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~/Downloads/sgs-thread/1-reset-configurations.mp4")
    args, parts, n = [], [], 0
    for i, (src, picks) in enumerate(PICKS):
        args += ["-i", os.path.join(root, src)]
        for k in picks:
            parts.append(
                f"[{i}:v]trim=start_frame={k * FPS}:end_frame={(k + 1) * FPS},setpts=PTS-STARTPTS,"
                f"crop=2880:1620:480:60,scale=1920:1080:flags=lanczos,setsar=1[p{n}]"
            )
            n += 1
    graph = ";".join(parts) + ";" + "".join(f"[p{j}]" for j in range(n)) + f"concat=n={n}:v=1:a=0,fps={FPS}[v]"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", graph, "-map", "[v]",
         "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-crf", "14", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", "-an", out],
        check=True,
    )
    print("wrote", out)


if __name__ == "__main__":
    main()
