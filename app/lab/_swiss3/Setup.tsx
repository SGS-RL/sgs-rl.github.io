import { SETUP_SGS, SETUP_TASK, splitCheck, type SetupRow } from "./setupData";

// SetupSwiss from _method/Setup.tsx, reading this folder's setupData.

function Value({ v, mute }: { v: string; mute: string }) {
  const [text, check] = splitCheck(v);
  return (
    <>
      {text}
      {check && <span className={mute}>{text ? " (check)" : "(check)"}</span>}
    </>
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
