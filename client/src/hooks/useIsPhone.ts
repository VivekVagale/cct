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

/**
 * The same question, answered once and never revisited.
 *
 * `useIsPhone` above is right for everything it is used for — a starfield's
 * resolution, a heading's layer count, whether a pose renders — because those
 * are settings, and a device that rotates into a different answer should get
 * the new one.
 *
 * Which of the two sites to serve is not a setting. The phone gets a booking
 * wizard and the desktop gets the whole story, and they are different React
 * trees: following the query across a resize would unmount one and mount the
 * other, which throws away every field the visitor has typed. A tablet rotated
 * mid-form would lose the form.
 *
 * So this reads the query at first paint and keeps that answer for the life of
 * the page. A visitor who genuinely wants the other one reloads, which is also
 * what the "better on a desktop" link does.
 *
 * Read lazily rather than at module scope so the module stays importable
 * somewhere without a window — there is no SSR here today, and this costs
 * nothing to keep true.
 */
let routeIsPhone: boolean | null = null;

export function useIsPhoneRoute() {
  if (routeIsPhone === null) {
    routeIsPhone =
      typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
  }
  return routeIsPhone;
}
