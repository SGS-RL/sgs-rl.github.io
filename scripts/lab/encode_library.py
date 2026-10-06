#!/usr/bin/env python3
"""Encode the owner's footage into web media for the lab pages.

Usage:
    python3 scripts/lab/encode_library.py /path/to/SGS [--only ID ...]

/path/to/SGS is the unzipped folder from the owner's drive (Anymal-C,
Anymal-D PACE, Franka Sim, UR5e Real, UR5e Sim). Output goes to
public/lab/media/library/; existing outputs are skipped unless --force.

What it makes (manifest in app/lab/library.ts must match the ids):
    clips/{id}.mp4      960 px wide, 30 fps max, H.264, no audio
    clips-sm/{id}.mp4   384 px wide, for grids
    clips/{id}.jpg      poster frame
    UR5e sim pairs: the most interesting and a nominal run side by side
    (static close-up camera), each 640 x 360 with an 8 px white gap; the
    shorter run holds its last frame.
    runs/{id}.mp4       continuous runs in full, 960 px
    runs/{id}-fast.mp4  the same run sped up to about 10 s, 640 px
    reel.mp4, reel.jpg  the mock highlight reel, 1280 x 720
    standin-reel.mp4    a stand-in reel from the smaller files (see STANDIN)
    clips/standin-*     single sim runs standing in for pairs (STANDIN_CLIPS)

Requires ffmpeg. Add new footage by adding entries below and to library.ts.
"""

import argparse
import concurrent.futures as cf
import os
import subprocess
import sys

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "lab", "media", "library")
X264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"]

D = "Anymal-D PACE"
ANYMAL_D = [
    "balancing_beam", "climbing_box", "contour", "floating_island", "gap", "inverted_slope",
    "maze", "pit", "radiating_beam", "random_parallel_box", "stairs", "stepping_stones",
]

# Sim pairs from the owner's clip selector: (task, interesting clip, nominal clip).
PAIRS = [
    ("bnc", 5, 2),
    ("gear_mesh", 1, 3),
    ("nut", 1, 3),
    ("rod", 1, 2),
    ("waterproof", 1, 2),
    ("rectangular_peg", 3, 1),  # all three are nominal
]

REAL = [("rod", n) for n in range(1, 7)] + [("nut", 1), ("nut", 3)] + [("gear_mesh", n) for n in range(1, 6)]

# Excerpts of the Franka run (cuts at 12.8 s and 18.36 s): (id, start, end).
FRANKA = [("franka-sim-nut-1", 0.5, 6.5), ("franka-sim-nut-2", 12.9, 18.3), ("franka-sim-nut-3", 21.0, 27.0)]

RUNS = [
    ("run-anymal-c", "Anymal-C/conitnuous_one_min_run/anymal_c_1min_continuous_run.mp4", 6),
    ("run-ur5e-real-gear-mesh", "UR5e Real/gear_mesh/one_min_continuous_run/ur5e_gear_mesh_continuous.novoice.mp4", 6),
    ("run-franka-sim-nut", "Franka Sim/one_min_continuous_run/franka_nut_continuous_run.mp4", 3),
]

# Mock reel: (source, start, end, speed). Real robot first, then UR5e sim,
# Franka, ANYmal-D. Order and picks from the owner's message of 2026-10-05.
REEL = [
    ("UR5e Real/rod/clip5/ur5e_rod_clip5.novoice.mp4", 1.0, 5.0, 1),
    ("UR5e Real/nut/clip3/ur5e_nut_clip3.mp4", 2.0, 15.5, 3),
    ("UR5e Real/gear_mesh/clip1/ur5e_gear_mesh_clip1.novoice.mp4", 3.5, 11.5, 2),
    ("UR5e Sim/rod/clip1/rod_clip1_static_closeup.mp4", 0, 2.2, 1),
    ("UR5e Sim/bnc/clip5/bnc_clip5_static_closeup.mp4", 1.0, 4.1, 1),
    ("Franka Sim/one_min_continuous_run/franka_nut_continuous_run.mp4", 13.0, 16.0, 1),
    (f"{D}/climbing_box/anymal_d_climbing_box.mp4", 1.0, 3.5, 1),
    (f"{D}/stepping_stones/anymal_d_stepping_stones.mp4", 1.0, 3.5, 1),
    (f"{D}/gap/anymal_d_gap.mp4", 1.5, 4.0, 1),
]

# Stand-in reel (about 22 s) cut only from footage the Drive connector
# could fetch in a cloud session (files under about 6.5 MB): UR5e sim
# close-ups, then ANYmal-D. Used by /lab/highlights while reel.mp4 cannot
# be built there. Chapters: STANDIN_REEL in app/lab/library.ts.
STANDIN = [
    ("UR5e Sim/rod/clip1/rod_clip1_static_closeup.mp4", 0, 2.2, 1),
    ("UR5e Sim/nut/clip3/nut_clip3_static_closeup.mp4", 0, 3.1, 1),
    ("UR5e Sim/gear_mesh/clip3/gear_mesh_clip3_static_closeup.mp4", 0, 2.2, 1),
    ("UR5e Sim/waterproof/clip2/waterproof_clip2_static_closeup.mp4", 0, 2.0, 1),
    ("UR5e Sim/rectangular_peg/clip1/rectangular_peg_clip1_static_closeup.mp4", 0, 2.1, 1),
    (f"{D}/climbing_box/anymal_d_climbing_box.mp4", 1.0, 3.5, 1),
    (f"{D}/stepping_stones/anymal_d_stepping_stones.mp4", 1.0, 3.5, 1),
    (f"{D}/gap/anymal_d_gap.mp4", 1.5, 4.0, 1),
    (f"{D}/stairs/anymal_d_stairs.mp4", 1.0, 3.5, 1),
]

# Stand-in clips for the same reason: single UR5e sim runs (static
# close-up) where the pages show pairs. Items: STANDIN_CLIPS in library.ts.
STANDIN_CLIPS = [("rod", 1), ("nut", 3), ("gear_mesh", 3), ("waterproof", 2), ("rectangular_peg", 1)]

# ANYmal-D renders are 1920 x 1088; crop to 16:9 before scaling.
FIT = "crop=iw:min(ih\\,iw*9/16),scale={w}:-2"


def run(cmd):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *cmd], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-800:])


def duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(r.stdout)


def clip_jobs(src, ident, trim=None):
    """960 px clip, 384 px clip and poster from one source (optionally trimmed)."""
    t = ["-ss", str(trim[0]), "-to", str(trim[1])] if trim else []
    big = os.path.join(OUT, "clips", f"{ident}.mp4")
    small = os.path.join(OUT, "clips-sm", f"{ident}.mp4")
    jpg = os.path.join(OUT, "clips", f"{ident}.jpg")

    def go():
        run([*t, "-i", src, "-vf", FIT.format(w=960) + ",fps=30", "-crf", "27", *X264, big])
        run(["-i", big, "-vf", "scale=384:-2", "-crf", "29", *X264, small])
        run(["-ss", str(duration(big) * 0.6), "-i", big, "-frames:v", "1", "-q:v", "4", jpg])

    return [(big, go)]


def pair_jobs(root, task, a, b):
    ident = f"ur5e-sim-{task.replace('_', '-')}"
    src = [os.path.join(root, "UR5e Sim", task, f"clip{n}", f"{task}_clip{n}_static_closeup.mp4") for n in (a, b)]
    big = os.path.join(OUT, "clips", f"{ident}.mp4")
    small = os.path.join(OUT, "clips-sm", f"{ident}.mp4")
    jpg = os.path.join(OUT, "clips", f"{ident}.jpg")

    def go():
        d = max(duration(s) for s in src)
        f = (
            f"[0]scale=640:360,fps=30,tpad=stop_mode=clone:stop_duration={d},trim=0:{d},"
            "pad=648:360:0:0:white[l];"
            f"[1]scale=640:360,fps=30,tpad=stop_mode=clone:stop_duration={d},trim=0:{d}[r];"
            "[l][r]hstack"
        )
        run(["-i", src[0], "-i", src[1], "-filter_complex", f, "-crf", "27", *X264, big])
        run(["-i", big, "-vf", "scale=644:-2", "-crf", "29", *X264, small])
        run(["-ss", str(d * 0.6), "-i", big, "-frames:v", "1", "-q:v", "4", jpg])

    return [(big, go)]


def run_jobs(root, ident, rel, speed):
    src = os.path.join(root, rel)
    full = os.path.join(OUT, "runs", f"{ident}.mp4")
    fast = os.path.join(OUT, "runs", f"{ident}-fast.mp4")
    jpg = os.path.join(OUT, "runs", f"{ident}.jpg")

    def go():
        run(["-i", src, "-vf", "scale=960:-2,fps=30", "-crf", "28", *X264, full])
        run(["-i", full, "-vf", f"setpts=PTS/{speed},fps=30,scale=640:-2", "-crf", "29", *X264, fast])
        run(["-ss", str(duration(full) * 0.3), "-i", full, "-frames:v", "1", "-q:v", "4", jpg])

    return [(full, go)]


def reel_jobs(root, segs=REEL, name="reel"):
    out = os.path.join(OUT, f"{name}.mp4")

    def go():
        args, parts = [], []
        for k, (rel, a, b, speed) in enumerate(segs):
            args += ["-ss", str(a), "-to", str(b), "-i", os.path.join(root, rel)]
            parts.append(
                f"[{k}]crop=iw:min(ih\\,iw*9/16),scale=1280:720,setsar=1,"
                f"setpts=(PTS-STARTPTS)/{speed},fps=30[v{k}]"
            )
        f = ";".join(parts) + ";" + "".join(f"[v{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0"
        run([*args, "-filter_complex", f, "-crf", "26", *X264, out])
        run(["-ss", "0.5", "-i", out, "-frames:v", "1", "-q:v", "3", os.path.join(OUT, f"{name}.jpg")])

    return [(out, go)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--jobs", type=int, default=4)
    o = ap.parse_args()
    for d in ("clips", "clips-sm", "runs"):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)

    jobs = []
    for t in ANYMAL_D:
        jobs += clip_jobs(os.path.join(o.root, D, t, f"anymal_d_{t}.mp4"), f"anymal-d-{t.replace('_', '-')}")
    for task, n in REAL:
        name = f"ur5e_{task}_clip{n}" + ("" if task == "nut" else ".novoice")
        src = os.path.join(o.root, "UR5e Real", task, f"clip{n}", f"{name}.mp4")
        jobs += clip_jobs(src, f"ur5e-real-{task.replace('_', '-')}-{n}")
    franka = os.path.join(o.root, "Franka Sim/one_min_continuous_run/franka_nut_continuous_run.mp4")
    for ident, a, b in FRANKA:
        jobs += clip_jobs(franka, ident, (a, b))
    for task, a, b in PAIRS:
        jobs += pair_jobs(o.root, task, a, b)
    for ident, rel, speed in RUNS:
        jobs += run_jobs(o.root, ident, rel, speed)
    jobs += reel_jobs(o.root)
    jobs += reel_jobs(o.root, STANDIN, "standin-reel")
    for task, n in STANDIN_CLIPS:
        src = os.path.join(o.root, "UR5e Sim", task, f"clip{n}", f"{task}_clip{n}_static_closeup.mp4")
        jobs += clip_jobs(src, f"standin-ur5e-sim-{task.replace('_', '-')}")

    todo = [
        (out, go) for out, go in jobs
        if (o.force or not os.path.exists(out))
        and (not o.only or os.path.splitext(os.path.basename(out))[0] in o.only)
    ]
    print(f"{len(todo)} of {len(jobs)} items to encode", flush=True)
    with cf.ThreadPoolExecutor(o.jobs) as ex:
        futs = {ex.submit(go): out for out, go in todo}
        for fut in cf.as_completed(futs):
            out = futs[fut]
            try:
                fut.result()
                print("ok  ", os.path.relpath(out, OUT), flush=True)
            except Exception as e:  # keep going; report at the end
                print("FAIL", os.path.relpath(out, OUT), e, file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
