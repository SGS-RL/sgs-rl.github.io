// Serves the static build, answering byte-range requests ("Range:
// bytes=a-b") with 206 Partial Content: static assets alone return the
// whole file, and Safari on iPhone then refuses to play the video.
const worker = {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const range = request.headers.get("Range");
    if (!range || res.status !== 200) return res;
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === "" && m[2] === "")) return res;
    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    let start;
    let end;
    if (m[1] === "") {
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end)
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    const headers = new Headers(res.headers);
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    headers.set("Accept-Ranges", "bytes");
    return new Response(buf.slice(start, end + 1), { status: 206, headers });
  },
};

export default worker;
