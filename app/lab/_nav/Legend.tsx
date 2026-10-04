// Keys for the maze figures, drawn to match the canvas marks.

type Key = "wall" | "start" | "robot" | "goal" | "shade" | "dot";

function Swatch({ k }: { k: Key }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className="mr-1.5 inline-block h-3 w-3 align-[-1px]"
      aria-hidden="true"
    >
      {k === "wall" && <rect width="12" height="12" fill="var(--sw-fg)" />}
      {k === "start" && (
        <>
          <rect
            x="0.75"
            y="0.75"
            width="10.5"
            height="10.5"
            fill="none"
            stroke="var(--sw-fg)"
            strokeWidth="1.5"
          />
          <text
            x="6"
            y="9"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="var(--sw-fg)"
          >
            S
          </text>
        </>
      )}
      {k === "robot" && <circle cx="6" cy="6" r="3" fill="var(--sw-fg)" />}
      {k === "goal" && (
        <rect
          x="1.5"
          y="1.5"
          width="9"
          height="9"
          fill="none"
          stroke="var(--sw-accent)"
          strokeWidth="1.75"
        />
      )}
      {k === "shade" && (
        <>
          <rect width="6" height="12" fill="var(--sw-fg)" opacity="0.1" />
          <rect x="6" width="6" height="12" fill="var(--sw-fg)" opacity="0.3" />
        </>
      )}
      {k === "dot" && <circle cx="6" cy="6" r="4.5" fill="var(--sw-accent)" />}
    </svg>
  );
}

export default function Legend({
  items,
  className = "",
}: {
  items: [Key, string][];
  className?: string;
}) {
  return (
    <ul
      className={`sw-label flex flex-wrap gap-x-4 gap-y-1 text-sw-mute ${className}`}
    >
      {items.map(([k, label]) => (
        <li key={k} className="whitespace-nowrap">
          <Swatch k={k} />
          {label}
        </li>
      ))}
    </ul>
  );
}
