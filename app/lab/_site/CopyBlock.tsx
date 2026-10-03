"use client";

import { useState } from "react";

export default function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="pz-small overflow-x-auto whitespace-pre border-t border-black pb-4 pt-2 font-[inherit]">
        {text}
      </pre>
      <button
        type="button"
        className="pz-small absolute right-0 top-2 underline underline-offset-4"
        onClick={() =>
          navigator.clipboard?.writeText(text).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            },
            () => {},
          )
        }
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
