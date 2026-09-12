import { fieldClass } from "./fieldClass";

/**
 * The one free-text field, and what it asks for.
 *
 * The old prompt here described a finished shot — wet streets, headlight flare,
 * no rider — and got shot briefs back. The render is built from the bike, so
 * what is needed first is the bike: the parts on it, the paint, anything that
 * would be wrong if we modelled it from the catalogue photo.
 */
export function MachineNotes({ isOther }: { isOther: boolean }) {
  return (
    <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6] max-w-xl">
      Your Build
      <textarea
        name="description"
        rows={4}
        /* Required only under Other, and by the browser rather than by us. React
           drops the attribute entirely when this is false, so the sixty-machine
           path is untouched, and the field stays uncontrolled — toggling the
           flag does not remount it or throw away what has been typed.

           Deliberately not paired with a disabled submit button. A disabled
           button suppresses constraint validation altogether and leaves a dead
           control with no message, which is the exact failure the hint under it
           was written to fix. The vehicle gate needs its own lock in JS because
           a selected card is not something a native constraint can express; a
           textarea is, so the browser owns this one.

           `required` rejects only the empty string, so a single space satisfies
           it. Not worth policing — that is a reply away. */
        required={isOther}
        /* The column is `char_length(description) <= 5000`; past it the insert
           400s and the form can only say something went wrong. Pre-existing, and
           likelier now this field carries the machine itself. */
        maxLength={5000}
        placeholder={
          isOther
            ? "Make, model and year first — then the exhaust, the guards, the decals, a respray that isn't the stock colour, and anything you want the shot to do with it."
            : "Aftermarket exhaust, crash guards, custom decals, a respray that isn't the stock colour — and anything you want the shot to do with it."
        }
        className={`${fieldClass} resize-none placeholder:text-[#B8C4D6]/40`}
      />
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
