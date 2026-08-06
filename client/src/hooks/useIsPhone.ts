import { useEffect, useState } from "react";

/**
 * A phone, meaning a device that cannot afford what a desktop can.
 *
 * Coarse pointer *and* a narrow screen. Either alone is the wrong test: a
 * touchscreen laptop has a coarse pointer and a desktop GPU, and a small window
 * on a desktop is still a desktop. Both together is a phone or a small tablet,
 * which is the population that has to be spared the continuous WebGL.
 *
 * Read once and followed, so rotating a phone re-evaluates rather than leaving
 * it on whichever answer the first paint happened to give.
 */
const PHONE_QUERY = "(pointer: coarse) and (max-width: 900px)";

export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return isPhone;
}
