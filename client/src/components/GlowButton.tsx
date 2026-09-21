import { useState, type CSSProperties, type ReactNode } from "react";
import { BorderBeam } from "border-beam";
import "./GlowButton.css";

interface GlowButtonProps {
  href: string;
  children: ReactNode;
  /**
   * Type scale and padding for the face. Deliberately not defaulted — the nav
   * bar and the hero want the same control at very different sizes, and baking
   * one in here would mean every call site fighting it back off.
   */
  className?: string;
  /**
   * For the wrapper rather than the face — the ring and the glow are drawn by
   * the wrapper, so anything that changes the control's own box belongs here.
   * The mobile nav panel uses it to run the button full width.
   *
   * Layout and box properties only. Under the ring that is a hard rule and not
   * a preference: nothing that makes the wrapper a stacking context, which is to
   * say no transform, opacity or filter, because the glow is a negative-z
   * pseudo-element and would paint over the ring instead of behind it.
   * GlowButton.css has the long version. The beam draws its own layers and does
   * not care, but the rule stays written for whichever dressing is live.
   */
  wrapperClassName?: string;
  /** Fires alongside the navigation — the mobile panel closes itself on tap. */
  onClick?: () => void;
}

/**
 * The one line that takes the beam back out.
 *
 * `false` returns every "Start a Project" — nav, mobile panel and hero — to the
 * gradient ring and bloom, with nothing else to undo: GlowButton.css is
 * untouched and both dressings are still below. Its twin lives in
 * VehicleSearch.tsx and is deliberately separate, so the bar and the button can
 * be judged one at a time.
 */
const BEAM = true;

/**
 * The primary call to action, wearing the travelling beam.
 *
 * Two dressings, one face. Only one may be on at a time: the ring and bloom are
 * a glow system already — a gradient background showing through the wrapper's
 * padding, plus a blurred negative-z pseudo-element — and stacking the beam on
 * top gives one control two light sources that disagree about where the light
 * is.
 *
 * `size="md"` here where the search bar takes `line`. `line` travels the bottom
 * edge, which suits a control that is wide and short; on a button this size the
 * glow would spend most of a pass out under the rounded ends with nothing to
 * light, and what remained would read as an underline artefact rather than an
 * effect. `md` rings all four sides, which is what the preset is for.
 *
 * The radius moves onto the face. It came from `--glow-radius` on the span, and
 * `.glow-button__face` derives its own from that minus the ring width; with no
 * span there is no property, the `calc()` is invalid and the corners square off.
 * Both are restated here at the values the stylesheet already used, so the face
 * keeps exactly the radius it had, and BorderBeam auto-detects that radius from
 * the child rather than guessing a rectangle.
 */
export function GlowButton({
  href,
  children,
  className,
  wrapperClassName,
  onClick,
}: GlowButtonProps) {
  /*
   * Hover and focus both light it, which is the behaviour the ring had and the
   * swap dropped.
   *
   * Focus is not decoration here. GlowButton.css records that the button
   * previously had no focus indicator at all, and that lighting the bloom on
   * `:focus-within` was what gave a keyboard visitor the same signal a mouse
   * visitor gets — so hover alone would quietly take that back.
   *
   * Two flags rather than one, because they can overlap: tabbing to the button
   * and then moving the mouse off it should not put the light out while it is
   * still focused.
   */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lit = hovered || focused;

  /* Built once and dressed by whichever branch is live, so the two cannot drift
     — a face that differs between them is a bug nobody sees until the switch is
     thrown. */
  const face: ReactNode = (
    <a
      href={href}
      onClick={onClick}
      /* On the anchor, not on the BorderBeam. Its props type extends
         HTMLAttributes, but it does not spread the unrecognised ones onto its
         root — handlers passed there never fire. The anchor is the interactive
         element and the thing a pointer is actually over, so it is the right
         place regardless. */
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`glow-button__face ${className ?? ""}`}
      /* Inline rather than a class: `.glow-button__face` sets its background at
         one class of specificity and so would a Tailwind utility, leaving the
         winner down to which stylesheet lands last. Inline outranks both. */
      style={
        BEAM
          ? ({
              "--glow-radius": "0.9rem",
              "--glow-ring": "3px",
              /* The same grey glass the search bar wears, off #B8C4D6, so the
                 two controls read as one family. Solid black under a travelling
                 beam looks like a hole cut in the page. */
              backgroundColor: "rgba(184, 196, 214, 0.12)",
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </a>
  );

  if (!BEAM) {
    return (
      <span className={`glow-button ${wrapperClassName ?? ""}`}>{face}</span>
    );
  }

  return (
    <BorderBeam
      size="md"
      colorVariant="colorful"
      /* `strength` is the beam, glow and bloom's opacity; `brightness` a
         multiplier on the glow. Both lift together, so the light gains presence
         rather than just turning up the same dim thing. React's onFocus/onBlur
         are focusin/focusout, so they catch the anchor inside without a ref. */
      strength={lit ? 1 : 0.7}
      brightness={lit ? 2.8 : 1.3}
      /* Seconds for one pass, so smaller is faster. Matched to the search bar so
         the two are not visibly running at different speeds on the same screen. */
      duration={1.7}
      className={wrapperClassName ?? "inline-block"}
    >
      {face}
    </BorderBeam>
  );
}
