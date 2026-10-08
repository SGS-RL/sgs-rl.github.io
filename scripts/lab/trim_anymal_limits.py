#!/usr/bin/env python3
"""Trim the ANYmal limit renders to the obstacle crossing, for picking clips.

Usage:
    python3 scripts/lab/trim_anymal_limits.py ~/Downloads/anymal_limits \
        [--out ~/Downloads/anymal_limits_trimmed] [--pad 0] [--force]

The source folder (from the owner, 2026-10-08) holds
{anymal_c,anymal_d}/{terrain}/{config}/seed{k}/videos/course_chase_3q.mp4
and a limits_summary.txt per robot. It is only read, never written.

Each run walks to a yellow marker, which jumps ahead when reached:
    marker 1 (about 2 s in)  start of the obstacle
    marker 2                 obstacle crossed
    final marker             course complete, the video ends
The clip is marker 1 to marker 2. Runs whose config has "inside" start at
the bottom of the obstacle, so their clip is the start of the video to the
one marker jump. Markers are found by colour (a teleport between frames, or
a large marker vanishing). When marker 2 happens out of view, its time is
taken from the end of the video: the walk from marker 2 to the final marker
is the same length on every run (about 4.0 s on C, 3.4 s on D).

The log's "Course complete" is not trusted alone: a run only counts if the
robot (red pixels) is still in view at the end. The log calls some falls
complete (e.g. ANYmal D gap_d1.0_b0 seed5).

Output: {robot}/{terrain}/{config}_seed{k}.mp4 (full resolution, original
frame rate, frame-accurate), a .jpg poster each, trims.csv, trims.json and
index.html, a page for picking (open it in a browser). Requires ffmpeg and
numpy.
"""

import argparse
import concurrent.futures as cf
import csv
import html
import json
import math
import os
import re
import statistics
import subprocess

ROBOTS = {"anymal_c": "ANYmal C", "anymal_d": "ANYmal D"}

# Terrain folder -> title, and the clip id on the site where one exists.
TERRAINS = {
    "balancing_beam": ("Balancing beam", "balancing-beam"),
    "climbing_box": ("Climbing box", "climbing-box"),
    "contour": ("Contour", "contour"),
    "extreme_stair": ("Stairs", "stairs"),
    "floating_island": ("Floating island", "floating-island"),
    "gap": ("Gap", "gap"),
    "pit": ("Pit", "pit"),
    "radiating_beam": ("Radiating beam", "radiating-beam"),
    "radiating_beam_offset": ("Radiating beam, offset", None),
    "random_jump_box": ("Jump box", None),
    "random_parallel_box": ("Parallel boxes", "random-parallel-box"),
    "slope_inv": ("Inverted slope", "inverted-slope"),
    "stepping_stone": ("Stepping stones", "stepping-stones"),
}

# Marker analysis runs on frames scaled to this size.
W, H = 480, 272
MIN_AREA = 12  # yellow pixels for the marker to count as visible
JUMP_PX = 60  # centroid move in one frame that means a teleport
RED_MIN = 30  # red pixels for the robot to count as visible

X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-an"]


def ffmpeg(cmd):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *cmd], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-800:])


def fps_of(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
         "stream=r_frame_rate", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    a, b = r.stdout.strip().split("/")
    return float(a) / float(b)


def frame_stats(path):
    """Per frame: [yellow area, cx, cy, x0, x1, y0, y1, red pixels]."""
    import numpy as np

    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={W}:{H}:flags=area",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    out, n = [], W * H * 3
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.int16)
        r, g, b = f[..., 0], f[..., 1], f[..., 2]
        yellow = (r > 170) & (g > 150) & (b < 140) & (r - b > 70) & (g - b > 60) & (abs(r - g) < 60)
        red = int(((r > 140) & (g < 90) & (b < 90) & (r - g > 80)).sum())
        ys, xs = np.nonzero(yellow)
        if len(xs):
            out.append([int(len(xs)), float(xs.mean()), float(ys.mean()),
                        int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max()), red])
        else:
            out.append([0, None, None, None, None, None, None, red])
    p.wait()
    return out


def triggers(d):
    """Frames where the marker jumps: a teleport, or a large marker vanishing
    (away from the frame edge) because it moved out of view."""
    ev = []
    for i in range(1, len(d)):
        a, b = d[i - 1], d[i]
        if a[0] >= MIN_AREA and b[0] >= MIN_AREA:
            if math.hypot(b[1] - a[1], b[2] - a[2]) > JUMP_PX:
                ev.append(i)
        elif a[0] >= 150 and b[0] < MIN_AREA:
            edge = a[3] <= 2 or a[4] >= W - 3 or a[5] <= 2 or a[6] >= H - 3
            if not edge and all(x[0] < MIN_AREA for x in d[i:i + 3]):
                ev.append(i)
    merged = []
    for t in ev:
        if not merged or t - merged[-1] > 4:
            merged.append(t)
    return merged


def longest_unseen(d, a, b):
    """Longest run of frames in [a, b) without the robot in view."""
    longest = cur = 0
    for x in d[a:b]:
        cur = cur + 1 if x[7] < RED_MIN else 0
        longest = max(longest, cur)
    return longest


def read_status(src):
    """(robot, config, seed) -> outcome text; later lines win."""
    st = {}
    for robot in ROBOTS:
        p = os.path.join(src, robot, "limits_summary.txt")
        if not os.path.exists(p):
            continue
        for line in open(p):
            m = re.match(r"(\S+) (\S+) seed(\d+): (.*)", line.strip())
            if m:
                st[(robot, m.group(2), int(m.group(3)))] = m.group(4)
    return st


def plan_runs(runs):
    """Choose start and end frames for each run (see the module docstring)."""

    def finished(r):
        return r["status"].startswith("Course complete") and r["d"][-1][7] >= RED_MIN

    # Frames from the last marker jump to the end, on clean finished runs.
    tail = {}
    for robot in ROBOTS:
        t = [len(r["d"]) - r["trig"][-1] for r in runs if r["robot"] == robot and finished(r)
             and r["trig"] and (len(r["trig"]) == 2 or r["inside"])]
        if t:
            tail[robot] = statistics.median(t)

    for r in runs:
        d, fps, n = r["d"], r["fps"], len(r["d"])
        notes, start, end = [], None, None
        if r["inside"]:
            start, r["start_how"] = 0, "start of video"
        else:
            early = [t for t in r["trig"] if 1.2 * fps <= t <= 3.5 * fps]
            if early:
                start, r["start_how"] = early[0], "marker 1"
            else:
                start, r["start_how"] = round(2.0 * fps), "estimated, 2 s"
                notes.append("marker 1 not seen")
        later = [t for t in r["trig"] if t > start + fps]
        if finished(r) and r["robot"] in tail:
            expect = n - tail[r["robot"]]
            near = [t for t in later if abs(t - expect) <= 0.8 * fps]
            if near:
                end, r["end_how"] = near[-1], "marker"
            else:
                end = round(expect)
                # Don't end on a view without the robot (camera inside a rock).
                while end > start + fps and d[end - 1][7] < RED_MIN:
                    end -= 1
                r["end_how"] = f"estimated, end of video - {tail[r['robot']] / fps:.1f} s"
                notes.append("marker 2 not seen")
            r["verdict"] = "crossed"
        elif later and longest_unseen(d, start, later[0]) < fps and d[later[0] - 1][7] >= RED_MIN:
            end, r["end_how"] = later[0], "marker"
            r["verdict"] = "crossed, then stuck"
        else:
            r["verdict"] = "did not cross"
            r["end_how"] = None
            if r["status"].startswith("Course complete"):
                notes.append("log says complete, but the robot leaves the frame")
        if end is not None:
            gap = longest_unseen(d, start, end)
            if gap >= 0.5 * fps:
                notes.append(f"robot out of view {gap / fps:.1f} s")
        r.update(start=start, end=end, notes=notes)
    return tail


def difficulty(cfg):
    m = re.search(r"_d([0-9.]+)", cfg)
    return float(m.group(1)) if m else 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--out", default=None)
    ap.add_argument("--pad", type=float, default=0.0, help="seconds kept before and after")
    ap.add_argument("--force", action="store_true", help="re-encode existing clips")
    ap.add_argument("--jobs", type=int, default=6)
    o = ap.parse_args()
    src = os.path.abspath(os.path.expanduser(o.src))
    out = os.path.abspath(os.path.expanduser(o.out or src.rstrip("/") + "_trimmed"))
    assert not out.startswith(src + os.sep) and out != src, "output must be outside the source"
    cache = os.path.join(out, "_stats")
    os.makedirs(cache, exist_ok=True)
    status = read_status(src)

    runs = []
    for robot in ROBOTS:
        for dirpath, _, files in os.walk(os.path.join(src, robot)):
            if "course_chase_3q.mp4" not in files or not dirpath.endswith("videos"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, "course_chase_3q.mp4"), src)
            parts = rel.split(os.sep)
            if len(parts) != 6 or not re.fullmatch(r"seed\d+", parts[3]):
                continue  # test renders such as anymal_c/_newton_test
            _, terrain, cfg, seed = parts[:4]
            runs.append(dict(rel=rel, robot=robot, terrain=terrain, cfg=cfg, seed=int(seed[4:]),
                             inside="inside" in cfg,
                             status=status.get((robot, cfg, int(seed[4:])), "not in log")))
    runs.sort(key=lambda r: (r["robot"], r["terrain"], -difficulty(r["cfg"]), r["cfg"], r["seed"]))
    print(f"{len(runs)} runs", flush=True)

    def analyse(r):
        path = os.path.join(src, r["rel"])
        c = os.path.join(cache, r["rel"].replace(os.sep, "__") + ".json")
        if os.path.exists(c) and os.path.getmtime(c) >= os.path.getmtime(path):
            d = json.load(open(c))
        else:
            d = frame_stats(path)
            json.dump(d, open(c, "w"))
        r["d"], r["fps"], r["trig"] = d, fps_of(path), triggers(d)

    with cf.ThreadPoolExecutor(o.jobs) as ex:
        list(ex.map(analyse, runs))
    tail = plan_runs(runs)
    for robot, t in tail.items():
        print(f"{ROBOTS[robot]}: marker 2 to course complete takes {t:.0f} frames", flush=True)

    clips = [r for r in runs if r["end"] is not None]
    for r in clips:
        pad = round(o.pad * r["fps"])
        r["a"], r["b"] = max(0, r["start"] - pad), min(len(r["d"]), r["end"] + pad)
        r["clip"] = os.path.join(r["robot"], r["terrain"], f"{r['cfg']}_seed{r['seed']}.mp4")
        r["poster"] = r["clip"][:-4] + ".jpg"

    def encode(r):
        dst, poster = os.path.join(out, r["clip"]), os.path.join(out, r["poster"])
        meta = dst + ".frames"
        want = f"{r['a']} {r['b']}"
        if not o.force and os.path.exists(dst) and os.path.exists(meta) and open(meta).read() == want:
            return "kept"
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        ffmpeg(["-i", os.path.join(src, r["rel"]),
                "-vf", f"trim=start_frame={r['a']}:end_frame={r['b']},setpts=PTS-STARTPTS",
                *X264, dst])
        mid = (r["b"] - r["a"]) / 2 / r["fps"]
        ffmpeg(["-ss", f"{mid:.3f}", "-i", dst, "-frames:v", "1", "-vf", "scale=960:-2",
                "-q:v", "3", poster])
        open(meta, "w").write(want)
        return "encoded"

    with cf.ThreadPoolExecutor(o.jobs) as ex:
        futs = {ex.submit(encode, r): r for r in clips}
        for fut in cf.as_completed(futs):
            print(f"{fut.result():8s} {futs[fut]['clip']}", flush=True)

    fields = ["robot", "terrain", "cfg", "seed", "verdict", "start_s", "end_s", "length_s",
              "start_how", "end_how", "notes", "log", "clip", "source"]
    table = []
    for r in runs:
        has = r["end"] is not None
        table.append(dict(
            robot=ROBOTS[r["robot"]], terrain=r["terrain"], cfg=r["cfg"], seed=r["seed"],
            verdict=r["verdict"],
            start_s=round(r["a"] / r["fps"], 2) if has else "",
            end_s=round(r["b"] / r["fps"], 2) if has else "",
            length_s=round((r["b"] - r["a"]) / r["fps"], 2) if has else "",
            start_how=r["start_how"], end_how=r["end_how"] or "", notes="; ".join(r["notes"]),
            log=r["status"], clip=r.get("clip", ""), source=r["rel"],
        ))
    with open(os.path.join(out, "trims.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fields)
        w.writeheader()
        w.writerows(table)
    json.dump(table, open(os.path.join(out, "trims.json"), "w"), indent=1)
    write_index(out, src, runs)
    print(f"{len(clips)} clips from {len(runs)} runs -> {out}/index.html")


def write_index(out, src, runs):
    e = html.escape
    srcrel = os.path.relpath(src, out)
    body = []
    for robot, robot_name in ROBOTS.items():
        rr = [r for r in runs if r["robot"] == robot]
        body.append(f'<h2 id="{robot}">{robot_name} <span>{sum(r["end"] is not None for r in rr)} '
                    f"clips from {len(rr)} runs</span></h2>")
        for terrain in sorted({r["terrain"] for r in rr}, key=lambda t: TERRAINS.get(t, (t,))[0]):
            title, site = TERRAINS.get(terrain, (terrain, None))
            slot = f"on the site as anymal-{robot[-1]}-{site}" if site and robot == "anymal_d" else "new on the site"
            body.append(f'<section><h3>{e(title)} <span>{e(terrain)} · {slot}</span></h3>')
            tr = [r for r in rr if r["terrain"] == terrain]
            for cfg in dict.fromkeys(r["cfg"] for r in tr):
                cr = [r for r in tr if r["cfg"] == cfg]
                ok = [r for r in cr if r["end"] is not None]
                miss = [r for r in cr if r["end"] is None]
                body.append(f'<h4>{e(cfg)} <span>difficulty {difficulty(cfg):.1f} · '
                            f"{len(ok)} of {len(cr)} with a clip</span></h4>")
                if ok:
                    body.append('<div class="grid">')
                    for r in ok:
                        key = e(r["clip"])
                        notes = "".join(f'<li class="warn">{e(n)}</li>' for n in r["notes"])
                        if r["verdict"] != "crossed":
                            notes = f'<li class="warn">{e(r["verdict"])}</li>' + notes
                        body.append(
                            f'<figure data-key="{key}">'
                            f'<video src="{key}" poster="{e(r["poster"])}" muted loop playsinline preload="none"></video>'
                            f'<figcaption><label><input type="checkbox"> seed {r["seed"]}</label>'
                            f'<span>{(r["b"] - r["a"]) / r["fps"]:.1f} s · {r["a"] / r["fps"]:.2f}–{r["b"] / r["fps"]:.2f} s'
                            f' of <a href="{e(os.path.join(srcrel, r["rel"]))}">the original</a></span>'
                            f'<ul>{notes}</ul></figcaption></figure>'
                        )
                    body.append("</div>")
                if miss:
                    body.append('<p class="miss">No clip: ' + ", ".join(
                        f'<a href="{e(os.path.join(srcrel, r["rel"]))}">seed {r["seed"]}</a> '
                        f'({e("; ".join(r["notes"]) or r["status"])})' for r in miss) + "</p>")
            body.append("</section>")
    page = PAGE.replace("{{BODY}}", "\n".join(body))
    open(os.path.join(out, "index.html"), "w").write(page)


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ANYmal clip picker</title>
<style>
:root { --fg: #111; --bg: #fff; --mute: #666; --line: #ddd; --pick: #1a7f37; --warn: #9a6700; }
@media (prefers-color-scheme: dark) {
  :root { --fg: #eee; --bg: #111; --mute: #999; --line: #333; --pick: #3fb950; --warn: #d29922; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 14px/1.4 -apple-system, system-ui, sans-serif; }
header { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center;
  padding: 10px 16px; background: var(--bg); border-bottom: 1px solid var(--line); }
header b { font-size: 15px; }
header button, header label { font: inherit; }
main { padding: 0 16px 64px; }
h2 { margin: 32px 0 0; font-size: 20px; }
h3 { margin: 28px 0 0; font-size: 16px; border-top: 1px solid var(--fg); padding-top: 6px; }
h4 { margin: 14px 0 6px; font-size: 13px; font-weight: 600; }
h2 span, h3 span, h4 span { color: var(--mute); font-weight: 400; font-size: 13px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
figure { margin: 0; border: 2px solid transparent; }
figure.picked { border-color: var(--pick); }
video { display: block; width: 100%; aspect-ratio: 1920 / 1088; background: #888; cursor: pointer; }
figcaption { display: flex; flex-wrap: wrap; gap: 2px 10px; padding: 4px 2px; font-size: 13px; }
figcaption span { color: var(--mute); }
figcaption ul { flex-basis: 100%; margin: 0; padding: 0; list-style: none; }
.warn { color: var(--warn); }
.miss { color: var(--mute); font-size: 12px; margin: 4px 0 0; }
a { color: inherit; }
body.only-picked figure:not(.picked), body.only-picked .miss { display: none; }
#out { flex-basis: 100%; display: none; width: 100%; height: 120px; font: 12px ui-monospace, monospace; }
</style>
</head>
<body>
<header>
  <b>ANYmal clips</b>
  <a href="#anymal_c">C</a> <a href="#anymal_d">D</a>
  <label><input type="checkbox" id="auto" checked> play clips in view</label>
  <label><input type="checkbox" id="only"> picked only</label>
  <span id="count"></span>
  <button id="copy">Copy picks</button>
  <textarea id="out" readonly></textarea>
</header>
<main>
<p>Each clip runs from the first marker jump to the second (runs that start at the bottom: from the start of the video). Click a clip to play or pause it. Picks are kept in this browser.</p>
{{BODY}}
</main>
<script>
const KEY = "anymal-picks";
let picks = new Set();
try { picks = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...picks])); } catch {} };
const figs = [...document.querySelectorAll("figure")];
const count = () => { document.getElementById("count").textContent = picks.size + " picked"; };
for (const f of figs) {
  const box = f.querySelector("input"), v = f.querySelector("video");
  box.checked = picks.has(f.dataset.key);
  f.classList.toggle("picked", box.checked);
  box.addEventListener("change", () => {
    box.checked ? picks.add(f.dataset.key) : picks.delete(f.dataset.key);
    f.classList.toggle("picked", box.checked); save(); count();
  });
  v.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
}
count();
const auto = document.getElementById("auto");
const io = new IntersectionObserver((es) => {
  for (const x of es) {
    if (x.isIntersecting && auto.checked) x.target.play().catch(() => {});
    else if (!x.isIntersecting) x.target.pause();
  }
}, { threshold: 0.4 });
figs.forEach((f) => io.observe(f.querySelector("video")));
auto.addEventListener("change", () => { if (!auto.checked) figs.forEach((f) => f.querySelector("video").pause()); });
document.getElementById("only").addEventListener("change", (ev) => document.body.classList.toggle("only-picked", ev.target.checked));
document.getElementById("copy").addEventListener("click", async () => {
  const text = [...picks].sort().join("\\n");
  const out = document.getElementById("out");
  out.value = text; out.style.display = "block"; out.select();
  try { await navigator.clipboard.writeText(text); } catch {}
});
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
