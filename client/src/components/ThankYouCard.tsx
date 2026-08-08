import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, type CSSProperties } from "react";
import { MASCOT_POSES } from "@/data/mascot";
import "./GlowButton.css";
import "./ThankYouCard.css";

/*
 * The lanyard is loaded on demand, and this is not optional.
 *
 * It pulls a physics engine, a mesh-line library and a 2.4MB model, none of
 * which any visitor needs until they have actually sent a booking — which is
 * once, at the end, if at all. Imported normally it would be in the bundle every
 * visitor downloads before the hero's first frame.
 */
const Lanyard = lazy(() => import("./Lanyard"));

/**
 * What replaces the form once a request is in.
 *
 * A pass holding the studio's mascot, hanging from a lanyard that swings — a
 * rope simulation you can pick up and throw. It is the one moment on the site
 * with nothing else to do, which is what makes it the right place for the most
 * expensive thing on it.
 *
 * The words are not on the pass. They could be: the card's faces are textures
 * and the component takes images for them. They are underneath instead, because
 * text baked into a texture cannot be selected, read aloud, translated, or found
 * — and this is a confirmation, which is the one piece of copy on the page that
 * has to reach everybody. So the pass carries the mascot and the card below
 * carries the sentence, with `role="status"` on the words rather than on the
 * scene: a screen reader should announce the confirmation, not a canvas.
 *
 * Under reduced motion there is no lanyard at all. It is a swinging object with
 * momentum; there is no gentler version of it, and the message does not need
 * one to be read.
 */
export function ThankYouCard() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`thankyou-host${reduceMotion ? " thankyou-host--still" : ""}`}>
      {!reduceMotion && (
        /* No fallback of its own: the copy below is the confirmation and it is
           already on screen. A spinner over a card that has arrived would be
           telling the reader to wait for the decoration. */
        <Suspense fallback={null}>
          <div className="thankyou-lanyard" aria-hidden>
            <Lanyard
              position={[0, 0, 20]}
              gravity={[0, -40, 0]}
              frontImage={MASCOT_POSES.thankYou}
              backImage={MASCOT_POSES.thankYou}
              imageFit="contain"
            />
          </div>
        </Suspense>
      )}

      <span
        className="glow-button thankyou-glow"
        style={{ "--glow-radius": "20px" } as CSSProperties}
      >
        <div role="status" className="thankyou-card">
          <div className="thankyou-text">
            <p className="thankyou-head">Thank you for booking!</p>
            <p className="thankyou-body">
              We'll reply on your Instagram handle, or on WhatsApp. Double-check
              you left the right handle and number.
            </p>
            <span>
              Follow @coldchaintheory so our reply reaches you instead of sitting in
              your message requests.
            </span>
          </div>
        </div>
      </span>
    </div>
  );
}
