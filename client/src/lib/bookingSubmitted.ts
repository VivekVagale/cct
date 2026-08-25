import { useSyncExternalStore } from "react";

/**
 * Whether a booking has been sent in this visit.
 *
 * A module rather than a context, and four functions rather than a provider.
 * The one thing that needs to know is `PersistentLanyard`, which hangs off the
 * root beside the nav bar, and the one thing that sets it is the submit handler
 * in `Booking`, which is several scenes down inside `SceneDeck`. A provider
 * spanning those two would have to wrap the entire application to carry a
 * single boolean between them.
 *
 * In memory, deliberately. Not sessionStorage: the lanyard is the answer to
 * having just sent a request, and a reload is a different visit to the page --
 * coming back to a site still wearing the confirmation from an hour ago is a
 * decoration nobody asked for twice. Sending a second request in the same visit
 * is already covered, because this only ever goes one way.
 */
let submitted = false;
const listeners = new Set<() => void>();

/** Called once, from the submit handler, when the insert comes back ok. */
export function markBookingSubmitted() {
  if (submitted) return;
  submitted = true;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return submitted;
}

export function useBookingSubmitted() {
  /* Third argument is the server snapshot. Identical to the client's, because
     nothing has been submitted during a render on a server and this file is
     the only thing that could say otherwise. */
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
