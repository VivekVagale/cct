/**
 * The six steps of a booking, in order, named once.
 *
 * Both layouts read this. The desktop stacks all six down a page; the phone
 * shows one at a time behind a Next button. What must never differ between them
 * is the order, the numbering and the words — a visitor who starts a request on
 * a phone and finishes it on a laptop is looking at the same form, and "Step 02"
 * has to mean the same thing in both places.
 *
 * That is the whole reason this file exists. The step bodies genuinely differ
 * between the two widths and live with their layouts; this is the part that
 * cannot be allowed to drift, so it is not written twice.
 *
 * On the order itself, which changed when the phone layout was built:
 *
 * - Contact moved from 02 to 06. Name and email were the second thing asked,
 *   before a price had been seen or a build chosen. Asked last, the visitor has
 *   spent five steps on the request before reaching the field most likely to
 *   stop them.
 * - Price moved from 06 to 03. It sat at the foot of the longest section on the
 *   site, several screens below the build it belongs to. It is what people come
 *   for and it now follows the choice it prices.
 *
 * Both were mobile arguments first. They apply at every width, and leaving the
 * desktop on the old order would have made the numbering lie.
 */
export interface BookingStep {
  /** Stable key. Not shown; used for anchors and the wizard's state. */
  id: string;
  /** The number the visitor reads. Zero-padded, because "Step 6 of 6" reads as arithmetic and "06" reads as a label. */
  number: string;
  title: string;
  /**
   * The sentence under the title, where the title alone leaves the ask
   * ambiguous. Absent on the steps whose controls explain themselves — a
   * heading, a number and four chips need no third sentence between them.
   *
   * Two steps compute their own instead of taking this: the description, whose
   * opening line is false when the chosen machine is Other, and the machine
   * step, whose count of machines comes from the data.
   */
  hint?: string;
}

export const BOOKING_STEPS: BookingStep[] = [
  {
    id: "machine",
    number: "01",
    title: "Pick your machine.",
    hint: "Choose the vehicle, then its colour. Six steps in all — this is the only one that needs a decision from you before the form.",
  },
  {
    id: "build",
    number: "02",
    title: "Pick the kind of build.",
    hint: "Six builds. Two of them ask a handful of questions once you have chosen.",
  },
  {
    id: "price",
    number: "03",
    title: "What it costs.",
  },
  {
    id: "description",
    number: "04",
    title: "Tell us about your machine.",
    // Computed at the call site — see MachineNotes, which swaps the opening
    // clause when the chosen machine is Other and the card above names nothing.
  },
  {
    id: "usage",
    number: "05",
    title: "Who's it for?",
  },
  {
    id: "contact",
    number: "06",
    title: "How we reach you.",
    hint: "Name and email are all we need. The handles below are how we reply.",
  },
];

/** Looked up by id rather than by position, so inserting a step cannot silently renumber a lookup. */
export function bookingStep(id: string): BookingStep {
  const found = BOOKING_STEPS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown booking step: ${id}`);
  return found;
}
