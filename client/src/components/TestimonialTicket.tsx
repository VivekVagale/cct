import type { Testimonial } from "@/data/content";
import "./TestimonialTicket.css";

/**
 * A testimonial as a holographic ticket: the client's name where the stock
 * design says TICKET, the quote in the body, their role on the stub.
 *
 * Two things about the markup are load-bearing rather than stylistic.
 *
 * The three .notes layers must be the first three children. Their offsets come
 * from `.notes:nth-child(2)` and `(3)`, and nth-child counts every sibling, not
 * every sibling matching the selector — put anything ahead of them and two of
 * the three layers stop being offset and stack on top of each other.
 *
 * The <figcaption> is last in the DOM but first on screen. A figcaption is only
 * valid as the first or last child of its figure, and the first slot belongs to
 * the notes; grid-template-areas puts it back at the top visually, so source
 * order and painted order come apart here on purpose.
 *
 * The #bump filter it references is rendered once per page by the section, not
 * once per card — three cards each carrying id="bump" would be three duplicate
 * ids, and only the first would ever be matched.
 */
export function TestimonialTicket({ t }: { t: Testimonial }) {
  // "Founder, Torque Collective" — the company reads as the stronger half, and
  // the stock CSS already ships a .bold for exactly this.
  const [title, ...rest] = t.role.split(", ");
  const company = rest.join(", ");

  return (
    <figure className="card">
      <div className="notes" aria-hidden>
        “““
      </div>
      <div className="notes" aria-hidden>
        “““
      </div>
      <div className="notes" aria-hidden>
        “““
      </div>

      <div className="bg holographic" aria-hidden />
      <span className="symbol" aria-hidden>
        ✂
      </span>

      <blockquote className="body">“{t.quote}”</blockquote>

      <div className="footer">
        <div className="number">
          {title}
          {company && (
            <>
              {" "}
              <span className="bold">{company}</span>
            </>
          )}
        </div>
        <div className="barcode" aria-hidden />
      </div>

      <figcaption className="header">{t.name}</figcaption>
    </figure>
  );
}

/**
 * The paper-bump filter the ticket's .bg refers to. Rendered once per page.
 *
 * Not part of the supplied CSS — that CSS calls url(#bump) and expects the
 * filter to already be in the document.
 *
 * "Bump" is bump-mapped lighting, and it is doing most of the work in the look
 * this is copied from: it is what turns a saturated conic gradient into pale,
 * grainy card stock. A displacement map here only warps the edges and leaves
 * the colour alone, which left the card looking like a screensaver and, worse,
 * broke the header — .header blends with `difference`, so it only resolves to
 * near-black type over a light backdrop. Over a mid-saturated one it splits
 * into whatever colour happens to be behind each letter.
 *
 * So: fine turbulence lit from the upper left for the grain, folded back over
 * the gradient with soft-light so the texture reads without darkening it, then
 * a white veil clipped to the card's own alpha to bring the whole thing up to
 * paper. The veil is what the pastel depends on.
 */
export function TicketBumpFilter() {
  return (
    <svg className="filter" aria-hidden width="0" height="0">
      <defs>
        <filter id="bump" x="0" y="0" width="100%" height="100%">
          {/* Card stock: pull the saturation down and lift the darks toward
              white. The gradients underneath are fully saturated — printed on
              paper they would not be, and the header depends on it, since
              `difference` only resolves to near-black type over a light
              backdrop. Lifting with a flat white veil instead washes the hues
              out altogether; this keeps them and just makes them pastel. */}
          <feColorMatrix in="SourceGraphic" type="saturate" values="0.5" result="desat" />
          <feComponentTransfer in="desat" result="stock">
            <feFuncR type="linear" slope="0.68" intercept="0.3" />
            <feFuncG type="linear" slope="0.68" intercept="0.3" />
            <feFuncB type="linear" slope="0.68" intercept="0.3" />
          </feComponentTransfer>

          {/* The bump itself: fine turbulence lit from the upper left, then
              multiplied back over the stock so it reads as grain in the paper
              rather than as a layer sitting on top of it. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed="3"
            result="noise"
          />
          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1" result="lit">
            <feDistantLight azimuth="235" elevation="60" />
          </feDiffuseLighting>
          <feComposite in="lit" in2="stock" operator="in" result="litClipped" />
          <feBlend in="stock" in2="litClipped" mode="multiply" result="grained" />

          <feComposite in="grained" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
