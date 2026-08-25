import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useBookingSubmitted } from "@/lib/bookingSubmitted";
import { getPass, warmModel } from "@/components/ThankYouCard";
import "./PersistentLanyard.css";

const Lanyard = lazy(() => import("./Lanyard"));

/** How far down the screen counts as "at the top", for revealing the control. */
const NEAR_TOP = 240;

/**
 * The pass, worn for the rest of the visit.
 *
 * It was the booking section's confirmation: a scene the height of that
 * section, which the reader scrolled past and left behind. The studio wants it
 * hanging from the nav bar and still there whatever section is on screen, so it
 * is mounted at the root beside the bar rather than inside a scene, fixed to
 * the viewport, and told to appear by a module-level flag the submit handler
 * sets — see `lib/bookingSubmitted`.
 *
 * The section keeps the words. This is the object; `ThankYouCard` is the
 * message, in the document, where it can be read, selected and announced. Both
 * are drawn from the same constants, so they cannot say different things.
 *
 * Centred and at the size it always was, and therefore not interactive: the
 * layer takes no pointer events, because a canvas over the viewport takes all
 * of them. The reasoning is in the stylesheet and it is the only decision here
 * that is not cosmetic.
 *
 * Nothing under reduced motion. A swinging object with momentum has no gentler
 * version — it is the movement — and pinning a still picture of it over the
 * page for the rest of the visit is not the quiet version of that either.
 */
export function PersistentLanyard() {
  const submitted = useBookingSubmitted();
  const reduceMotion = useReducedMotion();
  const [pass, setPass] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [near, setNear] = useState(false);

  const wanted = submitted && !dismissed && !reduceMotion;

  /*
   * Everything the scene needs, waited on together, and only once it is wanted.
   *
   * The pass has to be painted, the scene's chunk has to arrive and the model
   * has to be fetched. Rendering before all three leaves an empty canvas, and
   * an empty canvas here is a rectangle of nothing pinned over the page. All of
   * this is usually already done: `preloadThankYou` starts it when a machine is
   * picked, five steps before the button, and both halves are idempotent.
   */
  useEffect(() => {
    if (!wanted) return;
    let live = true;
    void Promise.all([getPass(), import("./Lanyard"), warmModel()]).then(
      ([url]) => {
        if (live) setPass(url);
      },
    );
    return () => {
      live = false;
    };
  }, [wanted]);

  /*
   * Whether the pointer is at the top of the screen, which is what reveals the
   * dismiss control.
   *
   * On the window rather than on the layer, because the layer takes no pointer
   * events and so has no hover of its own to listen for. The state is a boolean
   * that changes twice a visit rather than on every move — the listener runs a
   * comparison and returns, and React is only told when the answer flips.
   */
  useEffect(() => {
    if (!wanted) return;
    const onMove = (e: PointerEvent) => setNear(e.clientY < NEAR_TOP);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [wanted]);

  if (!wanted || !pass) return null;

  return (
    /* aria-hidden and not focusable: every word on the pass is already in the
       booking section's `role="status"`, and this is that message as pixels on
       a mesh. Announcing it twice is worse than not announcing it here. */
    <div className={`lanyard-dock${near ? " lanyard-dock--near" : ""}`} aria-hidden>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Put the pass away"
        className="lanyard-dock__dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <Suspense fallback={null}>
        {/* The camera the confirmation always used. At 20 the card was a
            thumbnail; this is the distance the pass was designed to be read at
            and the size the studio asked for it back at. */}
        <Lanyard
          position={[0, 0, 13]}
          gravity={[0, -40, 0]}
          frontImage={pass}
          backImage={pass}
          imageFit="cover"
        />
      </Suspense>
    </div>
  );
}
