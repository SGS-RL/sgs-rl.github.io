#!/usr/bin/env python3
"""Export Patrick's SGS learning-progress bundle for Method part 03.

Usage:
    python3 scripts/lab/encode_learning.py /path/to/mateo_sgs_learning_progress [--hd]

The bundle (mateo_sgs_learning_progress_repro_20261007.zip, unzipped) holds,
per UR5e task, one fixed reset (a task configuration) evaluated at training
checkpoints: 64 trials each, a clip of the policy at the checkpoints with
footage, and the SGS rule's weight for each measured success count. The
bundle is read only. This writes:

    public/media/library/learning/{task}.mp4   the clips in ledger order,
        cropped to x = 320..1600 (1280 x 1080), 960 wide, 30 fps, 1x, short
        keyframe interval for seeking (git-ignored, like the rest of the
        library)
    public/media/library/learning/{task}.jpg   poster (first frame)
    app/lab/_combined/learningData.ts               what the page draws

and checks that each video has as many frames as its ledger, and that the
clip ranges written for the page match the ledger's iteration on every
frame. Requires ffmpeg and ffprobe.

--hd (2026-10-09: the 960 px files look soft when the video is large) writes
the same frames at the render's full size, 1280 x 1080, CRF 25, to
public/media/library/learning-hd/, and leaves learningData.ts alone
(the frames and clips are the same).
"""

import json
import os
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "public", "media", "library", "learning")
HD = "--hd" in sys.argv
if HD:
    OUT += "-hd"
DATA = os.path.join(ROOT, "app", "lab", "_combined", "learningData.ts")
X264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an"]

# The page's order and names (nut first, owner 2026-10-08), with the
# bundle's keys. The numeric suffixes are run identifiers.
TASKS = [
    ("nut_base_8400", "nut", "Nut on bolt"),
    ("rod_perstep_3999", "rod", "Rod in hole"),
    ("gear_mesh_medium", "gear-mesh", "Gear mesh"),
    ("bnc", "bnc", "BNC connector"),
    ("waterproof", "waterproof", "Waterproof connector"),
    ("rectangular_peg_16mm", "rectangular-peg", "Rectangular peg"),
]


def ff(*args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *args], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-800:])


def frames(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
         "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return int(r.stdout.strip())


def export(bundle, key, slug, title):
    ledger = json.load(open(os.path.join(bundle, "data", key, "FRAME_LEDGER.json")))
    sweep = json.load(open(os.path.join(bundle, "data", key, "SWEEP_RESULT.json")))
    ledger.sort(key=lambda r: r["output_frame"])
    assert [r["output_frame"] for r in ledger] == list(range(len(ledger)))
    assert all(r["playback_speed"] == 1 and not r["sample_hold"] for r in ledger)

    # Clips: contiguous output frames per checkpoint, each a contiguous run
    # of source frames, in increasing source order.
    clips = []
    for r in ledger:
        if not clips or clips[-1]["clip"] != r["clip"]:
            clips.append({"clip": r["clip"], "it": r["iteration"], "start": r["output_frame"],
                          "src": r["source_render_frame"], "n": 0})
        c = clips[-1]
        assert r["iteration"] == c["it"]
        assert r["source_render_frame"] == c["src"] + c["n"]
        c["n"] += 1
    for a, b in zip(clips, clips[1:]):
        assert b["src"] >= a["src"] + a["n"]

    raw = os.path.join(bundle, "data", key, "raw_scene.mp4")
    mp4 = os.path.join(OUT, f"{slug}.mp4")
    jpg = os.path.join(OUT, f"{slug}.jpg")
    pick = "+".join(f"between(n\\,{c['src']}\\,{c['src'] + c['n'] - 1})" for c in clips)
    ff("-i", raw, "-vf",
       f"select='{pick}',setpts=N/30/TB,crop=1280:1080:320:0,{'' if HD else 'scale=960:-2,'}setsar=1",
       "-r", "30", "-g", "10", "-bf", "0", "-crf", "25" if HD else "27", *X264, mp4)
    ff("-i", mp4, "-frames:v", "1", "-q:v", "4", jpg)
    n = frames(mp4)
    assert n == len(ledger), f"{key}: {n} frames, ledger {len(ledger)}"

    out_clips = [{"it": c["it"], "start": c["start"], "end": c["start"] + c["n"] - 1} for c in clips]
    for r in ledger:
        c = next(c for c in out_clips if c["start"] <= r["output_frame"] <= c["end"])
        assert c["it"] == r["iteration"]

    curve = sweep["priority_rule"]["relative_to_peak_for_successes_0_to_64"]
    assert len(curve) == 65
    rows = []
    for r in sweep["rows"]:
        assert r["trials"] == 64
        assert abs(curve[r["successes"]] - r["illustrated_relative_priority"]) < 1e-9
        row = {"it": r["checkpoint"], "s": r["successes"], "lo": round(r["wilson95"][0], 4),
               "hi": round(r["wilson95"][1], 4)}
        # Nut: the early zero-success rows come from a separate evaluation
        # batch, not paired with the later dense sweep (bundle README).
        if r.get("paired_with_dense_batch") is False:
            row["separate"] = True
        rows.append(row)
    footage = {c["it"] for c in out_clips}
    assert footage <= {r["it"] for r in rows}
    return {
        "key": slug,
        "title": title,
        "src": f"/media/library/learning/{slug}.mp4",
        "poster": f"/media/library/learning/{slug}.jpg",
        "fps": 30,
        "frames": len(ledger),
        "trials": 64,
        "clips": out_clips,
        "rows": rows,
        "curve": [round(v, 4) for v in curve],
        "rule": sweep["priority_rule"]["settings"],
    }, os.path.getsize(mp4)


def main():
    bundle = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    tasks = []
    for key, slug, title in TASKS:
        t, size = export(bundle, key, slug, title)
        print(f"ok   {slug:16s} {t['frames']:4d} frames  {size / 1e6:.2f} MB", flush=True)
        tasks.append(t)
    # One preference rule for every task (manipulation: target 0.5, kappa 1).
    assert all(t["rule"] == tasks[0]["rule"] and t["curve"] == tasks[0]["curve"] for t in tasks)
    curve = tasks[0]["curve"]
    rule = tasks[0]["rule"]
    for t in tasks:
        del t["curve"], t["rule"]
    if HD:
        return
    with open(DATA, "w") as f:
        f.write(
            "// Generated by scripts/lab/encode_learning.py from Patrick's SGS\n"
            "// learning-progress bundle (2026-10-07). Do not edit by hand.\n"
            "//\n"
            "// Per UR5e task: one fixed reset (a task configuration), 64 trials\n"
            "// per training checkpoint. rows: every measured checkpoint (it), its\n"
            "// successes (s) and 95% Wilson interval (lo, hi); `separate` marks\n"
            "// rows from a separate evaluation batch. clips: output frames of the\n"
            "// footage per checkpoint. CURVE: the SGS rule's weight relative to its\n"
            "// peak for 0..64 successes of 64 (an illustration of the rule, not\n"
            "// measured sampling frequency).\n\n"
            "export type LearningRow = {\n  it: number;\n  s: number;\n  lo: number;\n  hi: number;\n"
            "  separate?: boolean;\n};\n"
            "export type LearningTask = {\n  key: string;\n  title: string;\n  src: string;\n"
            "  poster: string;\n  fps: number;\n  frames: number;\n  trials: number;\n"
            "  clips: { it: number; start: number; end: number }[];\n  rows: LearningRow[];\n};\n\n"
            f"export const RULE = {json.dumps(rule)};\n\n"
            f"export const CURVE: number[] = {json.dumps(curve)};\n\n"
            f"export const TASKS: LearningTask[] = {json.dumps(tasks, indent=2)};\n"
        )
    print("wrote", os.path.relpath(DATA, ROOT))


if __name__ == "__main__":
    main()
