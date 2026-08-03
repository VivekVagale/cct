import type { ReactNode } from "react";
import "./SparkleButton.css";

/**
 * The sparkle button, wearing the logo's violet.
 *
 * The wrapper is not decoration: `.particle-pen` is positioned and lit by
 * `.sparkle-button:is(:hover, :focus-visible) ~ .particle-pen`, so it has to be
 * a following sibling of the button inside `.sp`. Nest it, or put it before the
 * button, and the particles never light.
 */

/**
 * Fixed rather than random. These are read as inline custom properties, and
 * generating them per render would give every particle a new position and delay
 * on each re-render of the form — the field state above this button changes on
 * every keystroke.
 */
const PARTICLES = [
  { x: 5, y: 22, duration: 2.2, delay: 0.4, alpha: 0.9, size: 0.28, ox: 600, oy: 900 },
  { x: 14, y: 68, duration: 3.1, delay: 1.2, alpha: 0.7, size: 0.2, ox: 1200, oy: 400 },
  { x: 22, y: 12, duration: 2.7, delay: 0.1, alpha: 1, size: 0.34, ox: 800, oy: 1100 },
  { x: 31, y: 84, duration: 3.6, delay: 1.9, alpha: 0.6, size: 0.22, ox: 400, oy: 700 },
  { x: 39, y: 34, duration: 2.4, delay: 0.7, alpha: 0.85, size: 0.3, ox: 1000, oy: 500 },
  { x: 46, y: 92, duration: 3.3, delay: 2.4, alpha: 0.75, size: 0.18, ox: 700, oy: 1300 },
  { x: 54, y: 8, duration: 2.9, delay: 0.3, alpha: 1, size: 0.32, ox: 1400, oy: 600 },
  { x: 61, y: 58, duration: 3.8, delay: 1.5, alpha: 0.65, size: 0.24, ox: 500, oy: 1000 },
  { x: 69, y: 26, duration: 2.6, delay: 0.9, alpha: 0.9, size: 0.26, ox: 900, oy: 300 },
  { x: 76, y: 78, duration: 3.4, delay: 2.1, alpha: 0.7, size: 0.2, ox: 1100, oy: 800 },
  { x: 84, y: 44, duration: 2.3, delay: 0.5, alpha: 0.95, size: 0.3, ox: 600, oy: 1200 },
  { x: 91, y: 16, duration: 3.7, delay: 1.7, alpha: 0.6, size: 0.22, ox: 1300, oy: 450 },
  { x: 96, y: 66, duration: 2.8, delay: 1.0, alpha: 0.8, size: 0.26, ox: 750, oy: 950 },
  { x: 9, y: 48, duration: 3.2, delay: 2.6, alpha: 0.7, size: 0.24, ox: 1050, oy: 650 },
  { x: 27, y: 56, duration: 2.5, delay: 1.4, alpha: 0.85, size: 0.28, ox: 850, oy: 1150 },
  { x: 43, y: 72, duration: 3.9, delay: 0.2, alpha: 0.6, size: 0.18, ox: 1250, oy: 550 },
  { x: 58, y: 38, duration: 2.1, delay: 2.2, alpha: 1, size: 0.32, ox: 650, oy: 1050 },
  { x: 73, y: 6, duration: 3.5, delay: 0.8, alpha: 0.75, size: 0.22, ox: 950, oy: 750 },
  { x: 88, y: 88, duration: 2.65, delay: 1.85, alpha: 0.9, size: 0.26, ox: 1150, oy: 350 },
  { x: 35, y: 20, duration: 3.05, delay: 1.1, alpha: 0.8, size: 0.2, ox: 550, oy: 1250 },
];

export function SparkleButton({
  children,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`sp ${className ?? ""}`}>
      <button className="sparkle-button" type={type} disabled={disabled}>
        <span className="spark" />
        <span className="backdrop" />
        <svg
          className="sparkle"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1"
          aria-hidden
        >
          <path d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" />
          <path d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40733 20.1215 6.71421 19.5794 7.14681 19.1468C7.57941 18.7142 8.12147 18.4073 8.715 18.259L9.75 18L8.715 17.741C8.12147 17.5927 7.57941 17.2858 7.14681 16.8532C6.71421 16.4206 6.40733 15.8785 6.259 15.285L6 14.25Z" />
          <path d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" />
        </svg>
        <span className="text">{children}</span>
      </button>

      <span className="particle-pen" aria-hidden>
        {PARTICLES.map((p, i) => (
          <svg
            key={i}
            className="particle"
            viewBox="0 0 15 15"
            style={
              {
                "--x": p.x,
                "--y": p.y,
                "--duration": p.duration,
                "--delay": p.delay,
                "--alpha": p.alpha,
                "--size": p.size,
                "--origin-x": `${p.ox}%`,
                "--origin-y": `${p.oy}%`,
              } as React.CSSProperties
            }
          >
            <path d="M6.937 3.846L7.75 1l.813 2.846a4.5 4.5 0 003.09 3.09L14.5 7.75l-2.846.813a4.5 4.5 0 00-3.09 3.09L7.75 14.5l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1 7.75l2.846-.813a4.5 4.5 0 003.09-3.09z" />
          </svg>
        ))}
      </span>
    </div>
  );
}
