import type { ReactNode } from "react";
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
   * Layout and box properties only. Nothing that makes the wrapper a stacking
   * context, which is to say no transform, opacity or filter: the glow is a
   * negative-z pseudo-element and would paint over the ring instead of behind
   * it. GlowButton.css has the long version.
   */
  wrapperClassName?: string;
  /** Fires alongside the navigation — the mobile panel closes itself on tap. */
  onClick?: () => void;
}

/**
 * The primary call to action: a gradient ring around an opaque face, with the
 * ring blooming into a glow on hover.
 *
 * Kept as one component rather than repeated at each call site because the
 * effect depends on a pseudo-element at a negative z-index, and that only works
 * while nothing on the wrapper creates a stacking context. That is an easy
 * constraint to break by accident and a confusing one to debug — see
 * GlowButton.css.
 */
export function GlowButton({
  href,
  children,
  className,
  wrapperClassName,
  onClick,
}: GlowButtonProps) {
  return (
    <span className={`glow-button ${wrapperClassName ?? ""}`}>
      <a href={href} onClick={onClick} className={`glow-button__face ${className ?? ""}`}>
        {children}
      </a>
    </span>
  );
}
