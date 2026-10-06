"use client";

import { useState } from "react";
import { FULL_TITLE } from "./content";

// Puts the paper's full title on the clipboard, in one line.
export default function CopyTitle() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="underline decoration-1 underline-offset-[0.18em] hover:decoration-2"
      onClick={() =>
        navigator.clipboard?.writeText(FULL_TITLE).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          },
          () => {},
        )
      }
    >
      {copied ? "Copied" : "Copy title"}
    </button>
  );
}
