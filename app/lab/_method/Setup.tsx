import { SETUP_SGS, SETUP_TASK, splitCheck, type SetupRow } from "./setupData";

function Value({ v, mute }: { v: string; mute: string }) {
  const [text, check] = splitCheck(v);
  return (
    <>
      {text}
      {check && <span className={mute}>{text ? " (check)" : "(check)"}</span>}
    </>
  );
}

/**
 * Setup as a table in the playful system: one weight, rules between rows,
 * label | Locomotion | Manipulation. A value shared by both tasks spans
 * both columns.
 */
export function SetupPlayful({
  title = "Setup",
  mute = "opacity-55",
  rule = "border-current",
}: {
  title?: string;
  /** Class for "(check)" placeholders. */
  mute?: string;
  /** Border colour class for the rules. */
  rule?: string;
}) {
  const rows = (list: SetupRow[]) =>
    list.map(({ label, value }) => (
      <div key={label} className={`pz-grid border-t py-1.5 ${rule}`}>
        <dt className="col-span-2 md:col-span-4">{label}</dt>
        {typeof value === "string" ? (
          <dd className="col-span-4 md:col-span-8">
            <Value v={value} mute={mute} />
          </dd>
        ) : (
          value.map((v, i) => (
            <dd key={i} className="col-span-2 md:col-span-4">
              <Value v={v} mute={mute} />
            </dd>
          ))
        )}
      </div>
    ));
  return (
    <dl className="pz-small">
      <div className={`pz-grid border-t py-1.5 ${rule}`}>
        <dt className="col-span-2 md:col-span-4">{title}</dt>
        <dd className="col-span-2 md:col-span-4">Locomotion</dd>
        <dd className="col-span-2 md:col-span-4">Manipulation</dd>
      </div>
      {rows(SETUP_TASK)}
      <div className={`pz-grid border-t pb-1.5 pt-6 ${rule}`}>
        <dt className="col-span-6 md:col-span-12">SGS settings</dt>
      </div>
      {rows(SETUP_SGS)}
    </dl>
  );
}

/** Setup for the Swiss page, on the section's subgrid (4 / 9 columns). */
export function SetupSwiss() {
  const rows = (list: SetupRow[]) =>
    list.map(({ label, value }) => (
      <div
        key={label}
        className="col-span-full grid grid-cols-subgrid border-t border-sw-hair py-2.5"
      >
        <dt className="col-span-full pb-1 text-sw-mute md:col-span-3 md:pb-0">
          {label}
        </dt>
        {typeof value === "string" ? (
          <dd className="col-span-full md:col-span-6">
            <Value v={value} mute="text-sw-mute" />
          </dd>
        ) : (
          value.map((v, i) => (
            <dd key={i} className="col-span-2 md:col-span-3">
              <Value v={v} mute="text-sw-mute" />
            </dd>
          ))
        )}
      </div>
    ));
  return (
    <dl className="col-span-full grid grid-cols-subgrid">
      <div className="col-span-full grid grid-cols-subgrid pb-2.5">
        <dt className="sr-only">Task</dt>
        <dd className="col-span-2 font-medium md:col-span-3 md:col-start-4">
          Locomotion
        </dd>
        <dd className="col-span-2 font-medium md:col-span-3">Manipulation</dd>
      </div>
      {rows(SETUP_TASK)}
      <div className="col-span-full grid grid-cols-subgrid border-t border-sw-rule pb-2.5 pt-10">
        <dt className="col-span-full font-medium">SGS settings</dt>
      </div>
      {rows(SETUP_SGS)}
    </dl>
  );
}
