// One shared WebGL context renders every halftone on the page, then each
// result is copied into the caller's 2D canvas. Browsers cap live WebGL
// contexts at around 16, so one per video would not survive a clip grid.

export type HalftoneParams = {
  ink: [number, number, number]; // 0..1 rgb
  pitch: number; // dot spacing, device px
  angle?: number; // screen angle, radians
  focus?: [number, number]; // object-fit: cover focus point, 0..1
  lo?: number; // luminance that prints as solid ink
  hi?: number; // luminance that prints as paper
  gamma?: number; // >1 keeps mid tones light so dark subjects stand out
};

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// highp where available: dot maths runs in pixel units, which overflows
// mediump (fp16) precision on large phone canvases.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_pitch;
uniform float u_angle;
uniform vec3 u_ink;
uniform vec2 u_scale;
uniform vec2 u_offset;
uniform float u_lo;
uniform float u_hi;
uniform float u_gamma;
varying vec2 v_uv;
void main() {
  vec2 px = v_uv * u_res;
  float c = cos(u_angle), s = sin(u_angle);
  vec2 p = vec2(c * px.x - s * px.y, s * px.x + c * px.y);
  vec2 center = (floor(p / u_pitch) + 0.5) * u_pitch;
  vec2 cpx = vec2(c * center.x + s * center.y, -s * center.x + c * center.y);
  vec2 uv = clamp(cpx / u_res, 0.0, 1.0) * u_scale + u_offset;
  float lum = dot(texture2D(u_tex, uv).rgb, vec3(0.299, 0.587, 0.114));
  float dark = pow(clamp((u_hi - lum) / (u_hi - u_lo), 0.0, 1.0), u_gamma);
  float r = sqrt(dark) * u_pitch * 0.74;
  float cov = 1.0 - smoothstep(r - 0.8, r + 0.8, length(p - center));
  gl_FragColor = vec4(u_ink * cov, cov);
}`;

type Ctx = {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  tex: WebGLTexture;
  u: Record<string, WebGLUniformLocation | null>;
};

let ctx: Ctx | null | undefined;

function init(): Ctx | null {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const names = [
    "u_res",
    "u_pitch",
    "u_angle",
    "u_ink",
    "u_scale",
    "u_offset",
    "u_lo",
    "u_hi",
    "u_gamma",
  ];
  const u = Object.fromEntries(
    names.map((n) => [n, gl.getUniformLocation(prog, n)]),
  );
  return { gl, canvas, tex, u };
}

export function halftoneAvailable() {
  if (ctx === undefined) ctx = init();
  return ctx !== null;
}

export function drawHalftone(
  src: HTMLVideoElement | HTMLImageElement,
  out: HTMLCanvasElement,
  p: HalftoneParams,
) {
  if (ctx === undefined) ctx = init();
  if (!ctx) return false;
  const sw =
    src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
  const sh =
    src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
  const w = out.width;
  const h = out.height;
  if (!sw || !sh || !w || !h) return false;

  const { gl, canvas, tex, u } = ctx;
  if (canvas.width < w || canvas.height < h) {
    canvas.width = Math.max(canvas.width, w);
    canvas.height = Math.max(canvas.height, h);
  }
  gl.viewport(0, 0, w, h);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

  // object-fit: cover around the focus point.
  const [fx, fy] = p.focus ?? [0.5, 0.5];
  const srcA = sw / sh;
  const dstA = w / h;
  const sx = srcA > dstA ? dstA / srcA : 1;
  const sy = srcA > dstA ? 1 : srcA / dstA;
  const ox = Math.min(Math.max(fx - sx / 2, 0), 1 - sx);
  const oy = Math.min(Math.max(fy - sy / 2, 0), 1 - sy);

  gl.uniform2f(u.u_res, w, h);
  gl.uniform1f(u.u_pitch, p.pitch);
  gl.uniform1f(u.u_angle, p.angle ?? Math.PI / 4);
  gl.uniform3f(u.u_ink, ...p.ink);
  gl.uniform2f(u.u_scale, sx, sy);
  gl.uniform2f(u.u_offset, ox, oy);
  gl.uniform1f(u.u_lo, p.lo ?? 0.18);
  gl.uniform1f(u.u_hi, p.hi ?? 0.92);
  gl.uniform1f(u.u_gamma, p.gamma ?? 1);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const o = out.getContext("2d");
  if (!o) return false;
  o.clearRect(0, 0, w, h);
  // GL draws from the bottom-left of its (possibly larger) canvas.
  o.drawImage(canvas, 0, canvas.height - h, w, h, 0, 0, w, h);
  return true;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
