import type { ReactNode } from "react";

// The numbered section of /lab/swiss (rule, number, label, content on
// columns 4–12), on the capped page grid. `wide`: the content runs the
// full width under the heading row instead (for clip grids); `note` then
// sits beside the label. Copied from _swiss2.
export default function Section({
  id,
  n,
  label,
  note,
  wide = false,
  children,
}: {
  id: string;
  n: string;
  label: string;
  note?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="sw-grid s3-wrap pb-24 md:pb-36">
      <div className="col-span-full h-px bg-sw-rule" />
      <div className="sw-label sw-num col-span-1 pt-3">{n}</div>
      <h2 className="sw-label col-span-3 pt-3 font-medium md:col-span-2">
        {label}
      </h2>
      {wide ? (
        <>
          {note && (
            <div className="sw-label col-span-full mt-6 max-w-[60ch] text-sw-mute md:col-span-6 md:mt-0 md:pt-3">
              {note}
            </div>
          )}
          <div className="col-span-full mt-10 md:mt-14">{children}</div>
        </>
      ) : (
        <div className="col-span-full mt-10 grid grid-cols-subgrid gap-y-8 md:col-span-9 md:mt-0 md:pt-3">
          {children}
        </div>
      )}
    </section>
  );
}
