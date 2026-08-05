import { useReducedMotion } from "framer-motion";
import { MASCOT_POSES } from "@/data/mascot";
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
 */
export function ThankYouCard() {
  const reduceMotion = useReducedMotion();

  return (
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
  );
}
