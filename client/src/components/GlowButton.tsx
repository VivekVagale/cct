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
export function GlowButton({ href, children, className }: GlowButtonProps) {
  return (
    <span className="glow-button">
      <a href={href} className={`glow-button__face ${className ?? ""}`}>
        {children}
      </a>
    </span>
  );
}
