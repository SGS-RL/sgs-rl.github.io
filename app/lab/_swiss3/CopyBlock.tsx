"use client";

import { useState } from "react";

// BibTeX with a copy button, in the Swiss type.
export default function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="sw-label flex items-baseline justify-between gap-4">
        <span className="text-sw-mute">BibTeX</span>
        <button
          type="button"
          className="sw-link -my-2 py-2"
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
      <pre className="s3-pre mt-3 overflow-x-auto whitespace-pre bg-sw-panel p-4">
        {text}
      </pre>
      <p className="sr-only" aria-live="polite">
        {copied ? "BibTeX copied" : ""}
      </p>
    </div>
  );
}
