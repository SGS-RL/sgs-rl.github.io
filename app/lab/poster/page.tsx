import type { Metadata } from "next";
import PosterPage from "../_poster/PosterPage";

export const metadata: Metadata = { title: "Poster" };

export default function Page() {
  return <PosterPage />;
}
