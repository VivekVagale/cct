/**
 * The jets a Free Fall build can put around the machine.
 *
 * One of them is included in the price and the rest are a customisation the
 * studio charges for. That is the only thing this file decides; what the
 * surcharge is stays out of the codebase, the way every other figure on this
 * site does, and is quoted in conversation.
 *
 * A jet with no `image` is not dead data. It is an option the studio offers
 * and has not shot a frame of yet, and the card draws `PendingRender` for it
 * rather than borrowing a picture of something else -- the same argument, and
 * the same component, as `Vehicle.pending`. Dropping a file into
 * `client/public/jets/` and adding the path here is the whole job.
 *
 * NAMES ARE PROVISIONAL. They were written before the studio's frames arrived
 * and are what a client will read, so they want confirming. Renaming one is a
 * single line; removing one is a single entry.
 */
export interface Jet {
  id: string;
  name: string;
  /** A line under the name, where the name alone does not place it. */
  hint?: string;
  /** Absent until the frame exists. The card falls back to PendingRender. */
  image?: string;
  /**
   * The one included in the build's own price. Exactly one entry carries it,
   * and it is what the dialog preselects -- a client who opens the picker,
   * changes nothing and closes it has chosen the option that costs nothing.
   */
  isDefault?: boolean;
}

export const jets: Jet[] = [
  {
    id: "default",
    name: "Studio default",
    hint: "Included",
    isDefault: true,
  },
  {
    id: "tejas",
    name: "Tejas",
  },
  {
    id: "su-30-mki",
    name: "Su-30 MKI",
  },
  {
    id: "rafale",
    name: "Rafale",
  },
];

/** The entry the dialog opens on. Falls back to the first so the picker can
 *  never open with nothing chosen, even if the default flag is lost. */
export const defaultJet = jets.find((jet) => jet.isDefault) ?? jets[0];
