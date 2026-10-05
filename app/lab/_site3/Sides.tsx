import { PAIR_TRACKS } from "./items";

// What each side of a UR5e pair shows, in small type under its own half.
export default function Sides({
  sides,
  className = "",
}: {
  sides: [string, string];
  className?: string;
}) {
  return (
    <p
      className={`pz-small grid ${className}`}
      style={{ gridTemplateColumns: PAIR_TRACKS }}
    >
      <span className="min-w-0 pr-2">
        <span className="sr-only">Left: </span>
        {sides[0]}
      </span>
      <span className="col-start-3 min-w-0">
        <span className="sr-only">Right: </span>
        {sides[1]}
      </span>
    </p>
  );
}
