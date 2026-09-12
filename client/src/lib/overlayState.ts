import { useEffect, useState } from "react";

/**
 * Whether anything is currently covering the page.
 *
 * There are two such things — the colour picker and the build brief — and both
 * already know they are open. What could not know was the starfield, which sits
 * at the bottom of the page in App and has no relationship to either of them.
 *
 * On a phone that matters more than it sounds. The scrim behind both overlays is
 * 94% black there, so the starfield is not merely dimmed, it is invisible — and
 * it was still drawing a four-layer shader over the full viewport at 30fps
 * through the one animation every booking has to pass through. The tap that
 * opens the picker is competing with a render nobody can see.
 *
 * A counter rather than a boolean because the two can overlap: picking a machine
 * from inside a build brief would otherwise have the first one to close turn the
 * sky back on underneath the second.
 *
 * Module state rather than context, deliberately. The consumer is one component
 * at the root of the tree and the producers are two portals at the leaves;
 * threading a provider between them would mean every layer in between re-renders
 * when an overlay opens, which is the opposite of the point.
 */
let openCount = 0;
const listeners = new Set<(open: boolean) => void>();

function emit() {
  const open = openCount > 0;
  for (const listener of listeners) listener(open);
}

/** Called by an overlay as it mounts. Returns its own release. */
export function registerOverlay() {
  openCount += 1;
  emit();
  let released = false;
  return () => {
    /* Guarded because React can run an effect's cleanup more than once in
       StrictMode, and a count that goes negative would leave the sky paused for
       the rest of the session. */
    if (released) return;
    released = true;
    openCount = Math.max(0, openCount - 1);
    emit();
  };
}

export function useOverlayOpen() {
  const [open, setOpen] = useState(() => openCount > 0);

  useEffect(() => {
    listeners.add(setOpen);
    // Sync on mount: an overlay could have opened between render and effect.
    setOpen(openCount > 0);
    return () => {
      listeners.delete(setOpen);
    };
  }, []);

  return open;
}
