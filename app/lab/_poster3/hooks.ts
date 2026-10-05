"use client";

import { useCallback, useSyncExternalStore } from "react";

// True when the viewport is at least `min` px wide: large tiles take the
// 960 px encodes, small ones the 384 px ones. False on the server.
export function useWide(min = 1000) {
  const query = `(min-width: ${min}px)`;
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
