import type { ReactNode } from "react";

// Numbered section on the page grid. Content sits in a subgrid, so anything
// inside can align to the same columns as the rest of the page.
export default function Section({
  id,
  n,
  label,
  children,
}: {
  id: string;
  n: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="sw-grid scroll-mt-2 pb-24 md:pb-36">
      <div className="col-span-full h-px bg-sw-rule" />
      <div className="sw-label sw-num col-span-1 pt-3">{n}</div>
      <h2 className="sw-label col-span-3 pt-3 font-medium md:col-span-2">
        {label}
      </h2>
      <div className="col-span-full mt-10 grid grid-cols-subgrid gap-y-8 md:col-span-9 md:mt-0 md:pt-3">
        {children}
      </div>
    </section>
  );
}
