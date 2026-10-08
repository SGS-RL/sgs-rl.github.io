#!/usr/bin/env python3
"""Encode the owner's footage into web media for the lab pages.

Usage:
    python3 scripts/lab/encode_library.py /path/to/SGS [--only ID ...] \
        [--limits ~/Downloads/anymal_limits_trimmed] \
        [--premiere "~/Documents/Adobe/Premiere Pro/25.0"]

--limits is the output of scripts/lab/trim_anymal_limits.py, run on the
owner's ANYmal limit renders (2026-10-08); reel5 needs it. --premiere
takes the files of ADDED and REEL5 by name from the owner's flat Premiere
Pro folder instead of the drive folder (same files).

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
    clips/ur5e-sim-{task}-seq  the same two runs one after the other, the
    interesting run first, as one clip (the Clips section)
    runs/{id}.mp4       continuous runs in full, 960 px
    runs/{id}-fast.mp4  the same run sped up to about 10 s, 640 px
    reel.mp4, reel.jpg  the mock highlight reel, 1280 x 720
    reel4.mp4           the combined page's earlier reel (REEL4)
    reel5.mp4           the combined page's reel (REEL5)
    standin-reel.mp4    a stand-in reel from the smaller files (see STANDIN)
    clips/standin-*     single sim runs standing in for pairs (STANDIN_CLIPS)

    clips/anymal-{c,d}-limit-*  ANYmal C and D per terrain, from the
    trimmed limit renders (LIMITS; needs --limits, see below)

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

# Excerpts of continuous runs, at 1x, for rows of clips: (id, run, start, end).
RUN_EXCERPTS = [
    ("anymal-c-terrains", "Anymal-C/conitnuous_one_min_run/anymal_c_1min_continuous_run.mp4", 14.0, 20.0),
]

RUNS = [
    ("run-anymal-c", "Anymal-C/conitnuous_one_min_run/anymal_c_1min_continuous_run.mp4", 6),
    ("run-ur5e-real-gear-mesh", "UR5e Real/gear_mesh/one_min_continuous_run/ur5e_gear_mesh_continuous.novoice.mp4", 6),
    ("run-franka-sim-nut", "Franka Sim/one_min_continuous_run/franka_nut_continuous_run.mp4", 3),
]

# Mock reel: (source, start, end, speed). Real robot first, then UR5e sim,
# Franka, ANYmal-D. Order and picks from the owner's message of 2026-10-05;
# every segment at 1x since 2026-10-07 ("All the videos will be 1x").
REEL = [
    ("UR5e Real/rod/clip5/ur5e_rod_clip5.novoice.mp4", 1.0, 5.0, 1),
    ("UR5e Real/nut/clip3/ur5e_nut_clip3.mp4", 9.0, 13.5, 1),
    ("UR5e Real/gear_mesh/clip1/ur5e_gear_mesh_clip1.novoice.mp4", 5.0, 9.5, 1),
    ("UR5e Sim/rod/clip1/rod_clip1_static_closeup.mp4", 0, 2.2, 1),
    ("UR5e Sim/bnc/clip5/bnc_clip5_static_closeup.mp4", 1.0, 4.1, 1),
    ("Franka Sim/one_min_continuous_run/franka_nut_continuous_run.mp4", 13.0, 16.0, 1),
    (f"{D}/climbing_box/anymal_d_climbing_box.mp4", 1.0, 3.5, 1),
    (f"{D}/stepping_stones/anymal_d_stepping_stones.mp4", 1.0, 3.5, 1),
    (f"{D}/gap/anymal_d_gap.mp4", 1.5, 4.0, 1),
]

# The combined page's reel (owner, 2026-10-08, from labmates' feedback):
# nut first, then gear mesh, then the rod, each hardware clip whole at 1x
# (end None: to the end of the clip), so the nut is picked up on screen.
# The simulation chapters as in REEL.
REEL4 = [
    ("UR5e Real/nut/clip3/ur5e_nut_clip3.mp4", 0, None, 1),
    ("UR5e Real/gear_mesh/clip1/ur5e_gear_mesh_clip1.novoice.mp4", 0, None, 1),
    ("UR5e Real/rod/clip5/ur5e_rod_clip5.novoice.mp4", 0, None, 1),
    *REEL[3:],
]

# Footage added 2026-10-08, in the drive folder "SGS" since then, as single
# clips for the combined page's Results and Clips: (id, path in SGS, trim).
# The two new hardware nut runs (clip4, clip5), the gear spin, and the
# first 16 s of the one-minute Franka nut run. Items: ADDED in library.ts.
ADDED = [
    ("ur5e-real-nut-4", "UR5e Real/nut/clip4/sgs_nut_real_cleanaf.novoice.mp4", None),
    ("ur5e-real-nut-5", "UR5e Real/nut/clip5/sgs_nutreal_gentle_place_bettercolors.mp4", None),
    ("ur5e-real-gear-spin", "UR5e Real/gear_mesh/spin_gear/gear_spin.novoice.mp4", None),
    ("franka-sim-nut-1m", "Franka Sim/one_min_continuous_run/franka_nut_1m.mp4", (0, 16.0)),
    # The whole one-minute run, the Franka's only clip in Clips (owner,
    # 2026-10-08).
    ("franka-sim-nut-1m-full", "Franka Sim/one_min_continuous_run/franka_nut_1m.mp4", None),
]

# The combined page's reel, third cut (owner, 2026-10-08): (path, start,
# end, speed), end None for the whole clip. Paths are in the drive folder
# "SGS", or in --limits (the ANYmal crossings in LIMITS) after "limits:".
# Hardware: the two new nut runs, the gear spin, gear mesh clip 1 and rod
# clip 5, each whole. UR5e sim: rod and BNC as in REEL, and waterproof clip
# 1 whole (the interesting run of the pair). Franka: 0-16 s of the
# one-minute nut run. ANYmal C: 28-50 s of its one-minute run. ANYmal D:
# the picked climbing box, floating island and stepping stones crossings,
# whole. Chapter starts in library.ts (REEL5) come from the frame counts
# this prints.
REEL5 = [
    ("UR5e Real/nut/clip4/sgs_nut_real_cleanaf.novoice.mp4", 0, None, 1),
    ("UR5e Real/nut/clip5/sgs_nutreal_gentle_place_bettercolors.mp4", 0, None, 1),
    ("UR5e Real/gear_mesh/spin_gear/gear_spin.novoice.mp4", 0, None, 1),
    ("UR5e Real/gear_mesh/clip1/ur5e_gear_mesh_clip1.novoice.mp4", 0, None, 1),
    ("UR5e Real/rod/clip5/ur5e_rod_clip5.novoice.mp4", 0, None, 1),
    ("UR5e Sim/rod/clip1/rod_clip1_static_closeup.mp4", 0, 2.2, 1),
    ("UR5e Sim/bnc/clip5/bnc_clip5_static_closeup.mp4", 1.0, 4.1, 1),
    ("UR5e Sim/waterproof/clip1/waterproof_clip1_static_closeup.mp4", 0, None, 1),
    ("Franka Sim/one_min_continuous_run/franka_nut_1m.mp4", 0, 16.0, 1),
    ("Anymal-C/conitnuous_one_min_run/anymal_c_1min_continuous_run.mp4", 28.0, 50.0, 1),
    ("limits:anymal_d/climbing_box/climbing_box_low_d0.3_seed1.mp4", 0, None, 1),
    ("limits:anymal_d/floating_island/floating_island_d1.0_hv2.0_seed2.mp4", 0, None, 1),
    ("limits:anymal_d/stepping_stone/stepping_stone_d0.8_b0_seed5.mp4", 0, None, 1),
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
# Single UR5e sim runs (static close-up) for rows that show one run per
# task (the combined page's Overview): (task, clip).
SINGLES = [("rod", 1), ("bnc", 5), ("gear_mesh", 3)]

STANDIN_CLIPS = [("rod", 1), ("nut", 3), ("gear_mesh", 3), ("waterproof", 2), ("rectangular_peg", 1)]

# ANYmal C and D at the hardest setting each crosses (the owner's limit
# renders, 2026-10-08), one run per terrain picked by the owner from the
# clips that scripts/lab/trim_anymal_limits.py cut (first marker jump to
# the second; from the start for runs that begin at the bottom). Source:
# its output folder, passed as --limits. Radiating beam is the offset
# (rotated) layout on both robots (owner: "replace all radiating beams with
# the rotated ones"). Kept at their own frame rate (C 25 fps, D 20 fps).
# Items: LIMITS in app/lab/library.ts. (terrain id, file under anymal_c/
# and anymal_d/ for C, D.)
LIMITS = [
    ("balancing-beam", "balancing_beam/balancing_beam_d1.0_b0_seed2", "balancing_beam/balancing_beam_d0.9_b0_seed2"),
    ("climbing-box", "climbing_box/climbing_box_d0.8_b0_seed3", "climbing_box/climbing_box_low_d0.3_seed1"),
    ("contour", "contour/contour_d1.0_b0_seed4", "contour/contour_d1.0_b0_seed5"),
    ("floating-island", "floating_island/floating_island_d1.0_hv2.0_seed2", "floating_island/floating_island_d1.0_hv2.0_seed2"),
    ("gap", "gap/gap_d0.9_b0_seed2", "gap/gap_d0.8_b0_seed1"),
    ("inverted-slope", "slope_inv/slope_inv_d1.0_inside_b0_seed2", "slope_inv/slope_inv_d1.0_inside_b0_seed1"),
    ("jump-box", "random_jump_box/random_jump_box_d0.6_b0_seed1", "random_jump_box/random_jump_box_closer_d0.6_b0_seed3"),
    ("pit", "pit/pit_d0.7_inside_b0_seed1", "pit/pit_d0.6_inside_b0_seed1"),
    ("radiating-beam-offset", "radiating_beam_offset/radiating_beam_offset_d1.0_b0_seed1",
     "radiating_beam_offset/radiating_beam_offset_d1.0_b0_seed4"),
    ("random-parallel-box", "random_parallel_box/random_parallel_box_d0.6_b0_seed2",
     "random_parallel_box/random_parallel_box_d0.6_b0_seed3"),
    ("stairs", "extreme_stair/extreme_stair_d1.0_inside_b0_seed3", "extreme_stair/extreme_stair_d1.0_inside_b0_seed1"),
    ("stepping-stones", "stepping_stone/stepping_stone_d0.8_b0_seed1", "stepping_stone/stepping_stone_d0.8_b0_seed5"),
]

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


def clip_jobs(src, ident, trim=None, fps=30):
    """960 px clip, 384 px clip and poster from one source (optionally trimmed;
    fps None keeps the source's frame rate)."""
    t = ["-ss", str(trim[0]), "-to", str(trim[1])] if trim else []
    big = os.path.join(OUT, "clips", f"{ident}.mp4")
    small = os.path.join(OUT, "clips-sm", f"{ident}.mp4")
    jpg = os.path.join(OUT, "clips", f"{ident}.jpg")

    def go():
        vf = FIT.format(w=960) + (f",fps={fps}" if fps else "")
        run([*t, "-i", src, "-vf", vf, "-crf", "27", *X264, big])
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


def seq_jobs(root, task, a, b):
    """Two static close-up runs played one after the other (a, then b) as one clip."""
    ident = f"ur5e-sim-{task.replace('_', '-')}-seq"
    src = [os.path.join(root, "UR5e Sim", task, f"clip{n}", f"{task}_clip{n}_static_closeup.mp4") for n in (a, b)]
    big = os.path.join(OUT, "clips", f"{ident}.mp4")
    small = os.path.join(OUT, "clips-sm", f"{ident}.mp4")
    jpg = os.path.join(OUT, "clips", f"{ident}.jpg")

    def go():
        f = (
            "[0]scale=960:540,setsar=1,fps=30[a];[1]scale=960:540,setsar=1,fps=30[b];"
            "[a][b]concat=n=2:v=1:a=0"
        )
        run(["-i", src[0], "-i", src[1], "-filter_complex", f, "-crf", "27", *X264, big])
        run(["-i", big, "-vf", "scale=384:-2", "-crf", "29", *X264, small])
        # Poster from the interesting run.
        run(["-ss", str(duration(src[0]) * 0.6), "-i", big, "-frames:v", "1", "-q:v", "4", jpg])

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


def source(o, rel):
    """A file in the drive folder "SGS" (o.root), or after "limits:" in
    --limits. With --premiere, drive files come from that flat folder by name."""
    if rel.startswith("limits:"):
        return os.path.join(os.path.expanduser(o.limits), rel[len("limits:"):])
    if o.premiere:
        return os.path.join(os.path.expanduser(o.premiere), os.path.basename(rel))
    return os.path.join(o.root, rel)


def segment_frames(src, cut, speed):
    """Frames one reel segment contributes at 30 fps (crop and scale keep the count)."""
    r = subprocess.run(
        ["ffmpeg", "-v", "error", *cut, "-i", src, "-vf", f"setpts=(PTS-STARTPTS)/{speed},fps=30",
         "-an", "-f", "framecrc", "-"],
        capture_output=True, text=True, check=True,
    )
    return sum(1 for line in r.stdout.splitlines() if line and not line.startswith("#"))


def reel_jobs(root, segs=REEL, name="reel", frames=False):
    """One reel from segments; with frames, print each chapter's start frame at 30 fps."""
    out = os.path.join(OUT, f"{name}.mp4")

    def go():
        args, parts = [], []
        starts, at = [], 0
        for k, (rel, a, b, speed) in enumerate(segs):
            cut = ["-ss", str(a)] + (["-to", str(b)] if b is not None else [])
            if frames:
                starts.append(at)
                at += segment_frames(os.path.join(root, rel), cut, speed)
            args += [*cut, "-i", os.path.join(root, rel)]
            parts.append(
                f"[{k}]crop=iw:min(ih\\,iw*9/16),scale=1280:720,setsar=1,"
                f"setpts=(PTS-STARTPTS)/{speed},fps=30[v{k}]"
            )
        f = ";".join(parts) + ";" + "".join(f"[v{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0"
        run([*args, "-filter_complex", f, "-crf", "26", *X264, out])
        run(["-ss", "0.5", "-i", out, "-frames:v", "1", "-q:v", "3", os.path.join(OUT, f"{name}.jpg")])
        if frames:
            print(f"{name}: chapter start frames {starts}, {at} frames in all", flush=True)

    return [(out, go)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--limits", help="trim_anymal_limits.py's output folder (the LIMITS clips)")
    ap.add_argument("--premiere", help="take ADDED and REEL5 files by name from this flat folder "
                    "(the owner's Premiere Pro folder) instead of the drive folder")
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
    for ident, rel, a, b in RUN_EXCERPTS:
        jobs += clip_jobs(os.path.join(o.root, rel), ident, (a, b))
    for task, a, b in PAIRS:
        jobs += pair_jobs(o.root, task, a, b)
        jobs += seq_jobs(o.root, task, a, b)
    for ident, rel, speed in RUNS:
        jobs += run_jobs(o.root, ident, rel, speed)
    jobs += reel_jobs(o.root)
    jobs += reel_jobs(o.root, REEL4, "reel4")
    jobs += reel_jobs(o.root, STANDIN, "standin-reel")
    for ident, rel, trim in ADDED:
        jobs += clip_jobs(source(o, rel), ident, trim)
    if o.limits:
        segs = [(source(o, rel), a, b, speed) for rel, a, b, speed in REEL5]
        jobs += reel_jobs("", segs, "reel5", frames=True)
    else:
        print("REEL5 skipped: pass --limits", flush=True)
    for task, n in SINGLES:
        src = os.path.join(o.root, "UR5e Sim", task, f"clip{n}", f"{task}_clip{n}_static_closeup.mp4")
        jobs += clip_jobs(src, f"ur5e-sim-{task.replace('_', '-')}-{n}")
    for task, n in STANDIN_CLIPS:
        src = os.path.join(o.root, "UR5e Sim", task, f"clip{n}", f"{task}_clip{n}_static_closeup.mp4")
        jobs += clip_jobs(src, f"standin-ur5e-sim-{task.replace('_', '-')}")
    if o.limits:
        for terrain, c, d in LIMITS:
            for robot, rel in (("c", c), ("d", d)):
                src = os.path.join(os.path.expanduser(o.limits), f"anymal_{robot}", f"{rel}.mp4")
                jobs += clip_jobs(src, f"anymal-{robot}-limit-{terrain}", fps=None)
    else:
        print("LIMITS skipped (ANYmal C and D per terrain): pass --limits", flush=True)

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
