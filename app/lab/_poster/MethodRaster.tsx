"use client";

import { useEffect, useRef, useState } from "react";

// Schematic of the SGS loop as a raster. Each dot is one task
// configuration; its area is the policy's success rate there. The sampling
// weight below is illustrative (it only needs to peak at intermediate
// success), not the paper's exact function.
const weight = (p: number) => (p + 0.04) * Math.pow(1 - p, 0.9);
const STEPS = ["Sample", "Roll out", "Update", "Re-weight"];
const STEP_MS = 950;

function initial(n: number) {
  return Array.from({ length: n }, () => {
    const r = Math.random();
    return r < 0.55 ? 0 : r < 0.85 ? Math.random() * 0.35 : Math.random() * 0.8;
  });
}

function sample(p: number[], k: number) {
  const w = p.map(weight);
  const picked = new Set<number>();
  while (picked.size < k) {
    const total = w.reduce((a, b, i) => a + (picked.has(i) ? 0 : b), 0);
    let r = Math.random() * total;
    for (let i = 0; i < w.length; i++) {
      if (picked.has(i)) continue;
      r -= w[i];
      if (r <= 0) {
        picked.add(i);
        break;
      }
    }
  }
  return picked;
}

export default function MethodRaster({
  raster,
  type,
  ground,
  heightClass = "h-[118vw] md:h-[46vw]",
}: {
  raster: string;
  type: string;
  ground: string;
  heightClass?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curveRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);
  const [iter, setIter] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cols = 0;
    let rows = 0;
    let p: number[] = [];
    let shown: number[] = [];
    let picked = new Set<number>();
    let s = 0;
    let it = 1;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const c = w < 640 ? 9 : 20;
      const rr = Math.max(4, Math.round((h / w) * c));
      if (c !== cols || rr !== rows) {
        cols = c;
        rows = rr;
        p = initial(cols * rows);
        shown = [...p];
        picked = new Set();
      }
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cw = w / cols;
      const ch = h / rows;
      const cell = Math.min(cw, ch);
      for (let i = 0; i < p.length; i++) {
        shown[i] += (p[i] - shown[i]) * 0.12;
        const x = (i % cols) * cw + cw / 2;
        const y = Math.floor(i / cols) * ch + ch / 2;
        const r = Math.max(cell * 0.05, Math.sqrt(shown[i]) * cell * 0.5);
        ctx.fillStyle = raster;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (picked.has(i) && s < 3) {
          ctx.strokeStyle = type;
          ctx.lineWidth = s === 1 ? 3 : 1.5;
          ctx.beginPath();
          ctx.arc(x, y, cell * 0.44, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // Sampled configurations as marks on the weight curve.
      const svg = curveRef.current;
      if (svg) {
        const marks = svg.querySelectorAll<SVGCircleElement>("circle[data-m]");
        const list = [...picked];
        marks.forEach((m, k) => {
          const pi = list[k];
          if (pi === undefined || s === 3) {
            m.setAttribute("r", "0");
            return;
          }
          const x = shown[pi];
          m.setAttribute("cx", String(4 + x * 192));
          m.setAttribute("cy", String(66 - (weight(x) / 0.27) * 58));
          m.setAttribute("r", "3");
        });
      }
    };

    let raf = 0;
    const frame = () => {
      draw();
      raf = requestAnimationFrame(frame);
    };

    const advance = () => {
      s = (s + 1) % 4;
      if (s === 0) {
        const mean = p.reduce((a, b) => a + b, 0) / p.length;
        if (mean > 0.9) {
          p = initial(p.length);
          it = 0;
        }
        it += 1;
        picked = sample(p, Math.max(6, Math.round(p.length * 0.12)));
      }
      if (s === 2) {
        // Sampled configurations improve; a little transfers to the rest.
        picked.forEach((i) => {
          p[i] = Math.min(1, p[i] + 0.22 + 0.25 * Math.random() * (1 - p[i]));
        });
        for (let i = 0; i < p.length; i++)
          if (!picked.has(i) && p[i] > 0) p[i] = Math.min(1, p[i] + 0.012);
          else if (!picked.has(i) && Math.random() < 0.04) p[i] = 0.08;
      }
      setStep(s);
      setIter(it);
    };

    picked = sample(p, Math.max(6, Math.round(p.length * 0.12)));
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      if (e.isIntersecting) {
        raf = requestAnimationFrame(frame);
        if (!reduce) timer = setInterval(advance, STEP_MS);
      }
    });
    io.observe(wrap);
    draw();

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, [raster, type]);

  const curve = Array.from({ length: 41 }, (_, i) => {
    const x = i / 40;
    return `${4 + x * 192},${66 - (weight(x) / 0.27) * 58}`;
  }).join(" ");

  return (
    <div className="relative">
      <div ref={wrapRef} className={`relative ${heightClass}`}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pz-overprint absolute inset-0 h-full w-full"
        />
        {STEPS.map((label, k) => (
          <p
            key={label}
            className="pz-mid absolute px-1.5 pb-1 pt-0.5 transition-colors duration-200"
            style={{
              background: k === step ? type : ground,
              color: k === step ? ground : type,
              top: `${[4, 29, 54, 79][k]}%`,
              ...(k % 2 ? { right: 0 } : { left: k === 2 ? "18%" : 0 }),
            }}
          >
            <span className="pz-num mr-2">{k + 1}</span>
            {label}
          </p>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-6 gap-x-[var(--g)] md:grid-cols-12">
        <div className="pz-small col-span-3 md:col-span-3">
          <svg
            ref={curveRef}
            viewBox="0 0 200 80"
            className="w-full max-w-56"
            role="img"
            aria-label="Sampling weight against success rate: low at 0 and 1, highest in between"
          >
            <line
              x1="4"
              x2="196"
              y1="66"
              y2="66"
              stroke={type}
              strokeWidth="1"
            />
            <polyline
              points={curve}
              fill="none"
              stroke={type}
              strokeWidth="1.5"
            />
            {Array.from({ length: 40 }, (_, k) => (
              <circle key={k} data-m="" r="0" fill={raster} />
            ))}
            <text x="4" y="78" fontSize="9" fill={type}>
              0
            </text>
            <text x="196" y="78" fontSize="9" fill={type} textAnchor="end">
              1
            </text>
            <text x="100" y="78" fontSize="9" fill={type} textAnchor="middle">
              success rate
            </text>
          </svg>
          <p className="mt-1">Sampling weight</p>
        </div>
        <p className="pz-small pz-num col-span-3 md:col-span-2">
          Iteration {iter}
          <br />
          Step {step + 1}: {STEPS[step]}
        </p>
      </div>
    </div>
  );
}
