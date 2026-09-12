import { useRef } from "react";

/**
 * The one free-text field, and what it asks for.
 *
 * The old prompt here described a finished shot — wet streets, headlight flare,
 * no rider — and got shot briefs back. The render is built from the bike, so
 * what is needed first is the bike: the parts on it, the paint, anything that
 * would be wrong if we modelled it from the catalogue photo.
 *
 * ── On the height ────────────────────────────────────────────────────────────
 *
 * It was `rows={4}`, so the rule underneath sat at the bottom of four rows
 * whatever was in it. Empty, that is a long underline hanging well below the end
 * of the placeholder with nothing between the two — the field looks like it has
 * already been filled in and then cleared.
 *
 * The fix is not a smaller `rows`, which only moves the problem: too few and a
 * second sentence starts scrolling inside a box three lines tall.
 *
 * So the field is sized by its own content, using the mirror trick rather than
 * JavaScript measurement. An invisible span holding the same text, in the same
 * font at the same width, shares one grid cell with the textarea; the span sets
 * the row's height and the textarea stretches to it. No resize observer, no
 * scrollHeight read, nothing to run on a resize — the browser does the layout it
 * was always going to do.
 *
 * The span is fed the placeholder when the field is empty, so the rule sits just
 * under the prompt from the first paint, and the typed value after that.
 * `onInput` writes to the node directly rather than through state: this field is
 * uncontrolled because FormData collects it at submit, and making it controlled
 * to track a height would re-render the whole form on every keystroke.
 */
export function MachineNotes({ isOther }: { isOther: boolean }) {
  const mirror = useRef<HTMLSpanElement>(null);

  const placeholder = isOther
    ? "Make, model and year first — then the exhaust, the guards, the decals, a respray that isn't the stock colour, and anything you want the shot to do with it."
    : "Aftermarket exhaust, crash guards, custom decals, a respray that isn't the stock colour — and anything you want the shot to do with it.";

  /* Both boxes take these, and they have to match exactly or the two diverge by
     a line. Padding, type size, leading and wrapping all count. */
  const boxClass =
    "col-start-1 row-start-1 min-w-0 bg-transparent px-0 pt-3 pb-1.5 text-base leading-relaxed normal-case tracking-normal text-[#F5F7FA]";

  return (
    <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6] max-w-xl">
      Your Build:
      {/* The rule lives on the wrapper, not the textarea, so it sits at the
          bottom of whichever of the two boxes is taller — which is the point. */}
      <div className="grid border-b border-white/20 transition-colors focus-within:border-white/60">
        <span
          ref={mirror}
          aria-hidden
          /* The trailing space is load-bearing: a value ending in a newline
             would otherwise not extend the span, and the textarea would scroll
             by exactly one line at the moment a new paragraph is started. */
          className={`${boxClass} invisible whitespace-pre-wrap break-words`}
        >
          {placeholder}{" "}
        </span>
        <textarea
          name="description"
          rows={1}
          onInput={(e) => {
            const node = mirror.current;
            if (node) node.textContent = `${e.currentTarget.value || placeholder} `;
          }}
          /* Required only under Other, and by the browser rather than by us.
             React drops the attribute entirely when this is false, so the
             sixty-machine path is untouched, and the field stays uncontrolled —
             toggling the flag does not remount it or throw away what has been
             typed.

             Deliberately not paired with a disabled submit button. A disabled
             button suppresses constraint validation altogether and leaves a dead
             control with no message, which is the exact failure the hint under
             it was written to fix. The vehicle gate needs its own lock in JS
             because a selected card is not something a native constraint can
             express; a textarea is, so the browser owns this one.

             `required` rejects only the empty string, so a single space
             satisfies it. Not worth policing — that is a reply away. */
          required={isOther}
          /* The column is `char_length(description) <= 5000`; past it the insert
             400s and the form can only say something went wrong. Pre-existing,
             and likelier now this field carries the machine itself. */
          maxLength={5000}
          placeholder={placeholder}
          /* overflow-hidden because the box is never the thing that scrolls —
             the mirror has already made it tall enough. */
          className={`${boxClass} resize-none overflow-hidden outline-none placeholder:text-[#B8C4D6]/40`}
        />
      </div>
    </label>
  );
}

/**
 * The hint above it, which is false in one case and has to say so.
 *
 * The stock line opens on "the card above says what it is", which stops being
 * true the moment the card above is Other — that one names nothing. Under it
 * this field is the only place the machine gets named at all.
 */
export function machineNotesHint(isOther: boolean) {
  return isOther
    ? "The card above doesn't name it, so start here: make, model and year. Then what you have done to it."
    : "The card above says what it is. This is where you say what you have done to it.";
}
