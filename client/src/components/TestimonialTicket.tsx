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
    <figure className="card ticket">
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
        ”
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
 * It is not part of the supplied CSS — that CSS calls url(#bump) and expects
 * the filter to already exist in the document. Without it the reference simply
 * resolves to nothing, so the perforations come out as clean geometry instead
 * of a torn edge.
 */
export function TicketBumpFilter() {
  return (
    <svg className="filter" aria-hidden width="0" height="0">
      <defs>
        <filter id="bump">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.12"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
