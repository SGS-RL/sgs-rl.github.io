import type { Metadata } from "next";
import MoreQuilt from "../quilt/more";

// The Results quilt with more footage, version b (../quilt/versions.json),
// for the Twitter thread; rendered by scripts/lab/thread/render_quilt.mjs.
export const metadata: Metadata = { title: "Thread, Results quilt b" };

export default function Page() {
  return <MoreQuilt v="b" />;
}
