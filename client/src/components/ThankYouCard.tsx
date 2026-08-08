import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { MASCOT_POSES } from "@/data/mascot";
import "./GlowButton.css";
import "./ThankYouCard.css";

/**
 * What replaces the form once a request is in.
 *
 * `role="status"` because this arrives without the visitor moving focus: the
 * form they were looking at is simply gone, and a screen reader that is not
 * told so has nothing to announce.
 *
 * The mascot is decorative here — it carries no information the text does not,
 * so it is `alt=""` rather than the Mascot component, which would announce the
 * character on a card whose whole job is one sentence of confirmation.
 *
 * It wears the primary button's ring and bloom, borrowed the same way the
 * search field borrows them: the gradient is the wrapper's own background
 * showing through its padding, and the card is the opaque face sitting in it.
 * One gradient, one ring width, one blur, shared by every control on the page
 * that carries this treatment. The radius is set here because a card wants a
 * far softer corner than a button; the face derives its own from it, so the two
 * curves stay concentric.
 *
 * The lift on hover moves to the host rather than the card. The card is the
 * face, and scaling the face inside a ring that stayed put would have grown the
 * card out of its own edge — and the ring cannot take the transform itself,
 * because a stacking context on `.glow-button` inverts the bloom over it. See
 * GlowButton.css. The host is already a stacking context by way of the
 * `isolation` rule there, so a transform on it changes nothing about where the
 * bloom lands.
 */
export function ThankYouCard() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`thankyou-host${reduceMotion ? " thankyou-host--still" : ""}`}>
      <span
        className="glow-button thankyou-glow"
        style={{ "--glow-radius": "20px" } as CSSProperties}
      >
        <div
          role="status"
          className={`thankyou-card${reduceMotion ? " thankyou-card--still" : ""}`}
        >
          <img className="thankyou-mascot" src={MASCOT_POSES.thankYou} alt="" />
          <div className="thankyou-text">
            <p className="thankyou-head">Thank you for booking!</p>
            <p className="thankyou-body">
              We'll come back to you on your Instagram handle — or on WhatsApp, if
              you left a handle or number.
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
