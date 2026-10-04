// The SGS kernel typeset in plain HTML: single-letter Latin variables in
// italic, Greek upright, sub- and superscripts that keep the line height.

const sub = "relative top-[0.3em] text-[0.68em] leading-none";
const sup = "relative -top-[0.55em] text-[0.68em] leading-none";

function V({ children }: { children: React.ReactNode }) {
  return <i className="pr-[0.04em]">{children}</i>;
}

function PHat({ i = "i" }: { i?: string }) {
  return (
    <>
      <V>p̂</V>
      <span className={sub}>
        <V>{i}</V>
      </span>
    </>
  );
}

/** Weight, log score and softmax, one per line. */
export default function Formula({
  className = "",
  lines = "all",
}: {
  className?: string;
  /** "weight" shows only the kernel line. */
  lines?: "all" | "weight";
}) {
  return (
    <div
      role="math"
      aria-label="w sub i equals (p-hat sub i plus epsilon) to the power kappa t, times (1 minus p-hat sub i plus epsilon) to the power kappa (1 minus t). l sub i equals log of (w sub i plus epsilon). P of i equals exp of l sub i over T, divided by the sum over j of exp of l sub j over T."
      className={`sw-num whitespace-nowrap ${className}`}
    >
      <p>
        <V>w</V>
        <span className={sub}>
          <V>i</V>
        </span>{" "}
        = (<PHat /> + ε)
        <span className={sup}>
          κ<V>t</V>
        </span>{" "}
        (1 − <PHat /> + ε)
        <span className={sup}>
          κ(1 − <V>t</V>)
        </span>
      </p>
      {lines === "all" && (
        <>
          <p className="mt-[0.35em]">
            ℓ
            <span className={sub}>
              <V>i</V>
            </span>{" "}
            = log(<V>w</V>
            <span className={sub}>
              <V>i</V>
            </span>{" "}
            + ε)
          </p>
          <p className="mt-[0.35em] flex items-center gap-[0.3em]">
            <span>
              <V>P</V>(<V>i</V>) =
            </span>
            <span className="inline-flex flex-col items-center leading-[1.15]">
              <span className="px-[0.2em]">
                exp(ℓ
                <span className={sub}>
                  <V>i</V>
                </span>{" "}
                / <V>T</V>)
              </span>
              <span className="border-t border-current px-[0.2em] pt-[0.1em]">
                Σ
                <span className={sub}>
                  <V>j</V>
                </span>{" "}
                exp(ℓ
                <span className={sub}>
                  <V>j</V>
                </span>{" "}
                / <V>T</V>)
              </span>
            </span>
          </p>
        </>
      )}
    </div>
  );
}
