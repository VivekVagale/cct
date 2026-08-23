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
 * The names were provisional through four handoffs and are not any more: these
 * are the studio's own, read off the files they sent with the frames, with one
 * word taken out. The Spitfire arrived as `SPITFIRE 7370 SHARK`; the 7370 is an
 * asset number rather than a mark and the studio has said to drop it.
 *
 * `Su-30 MKK` is confirmed and not a slip. It is the export variant, where the
 * placeholder this replaces said MKI -- the one the Indian air force flies --
 * so the difference was worth asking about and has been asked.
 *
 * The Bf 109 is the reason `image` is optional and stays that way. It arrived
 * filed as `SPITFIRE 7370 IRON`, which it is not -- the studio has confirmed
 * the aircraft and it is named for it here. The frame itself is still not in
 * the repository: it carries a swastika on the tail fin, which is illegal to
 * display in several of the countries this site is read from, and the rename
 * does not touch the marking. So the option is offered and the card draws
 * `PendingRender` under it, exactly as it would for an aircraft nobody had
 * rendered yet. A re-render without the marking is one file and one line.
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

/* Default first, then alphabetical. The default leads because it is what the
   picker opens on and what the line under the grid prices everything against;
   the rest have no order of their own worth inventing one for. */
export const jets: Jet[] = [
  {
    id: "default",
    name: "MiG-29",
    /* The word "default" stays visible in the caption because the line under
       the grid charges against it by that name. The aircraft is named as well
       now that there is a picture of it -- an option showing a frame and
       calling itself only "Studio default" makes a client wonder what they
       are looking at. */
    hint: "Studio default, included",
    image: "/jets/mig-29.webp",
    isDefault: true,
  },
  {
    id: "b-2a-spirit-frost",
    name: "B-2A Spirit — Frost",
    image: "/jets/b-2a-spirit-frost.webp",
  },
  {
    id: "b-2a-spirit-phantom",
    name: "B-2A Spirit — Phantom",
    image: "/jets/b-2a-spirit-phantom.webp",
  },
  {
    id: "dassault-rafale",
    name: "Dassault Rafale",
    image: "/jets/dassault-rafale.webp",
  },
  {
    id: "f-16-block-70",
    name: "F-16 Block 70",
    image: "/jets/f-16-block-70.webp",
  },
  {
    id: "messerschmitt-bf-109",
    name: "Messerschmitt Bf 109",
    /* No `image`, and not because nobody rendered it. See the note at the top
       of this file: the frame exists, and the marking on it is why it is not
       in the repository. The card draws "No frame yet" under this one, which
       is what a client should be told either way -- there is no picture to
       choose by. No `hint` repeating it. */
  },
  {
    id: "mig-21-bison",
    name: "MiG-21 Bison",
    image: "/jets/mig-21-bison.webp",
  },
  {
    id: "spitfire-shark",
    name: "Spitfire — Shark",
    image: "/jets/spitfire-shark.webp",
  },
  {
    id: "su-30-mkk",
    name: "Su-30 MKK",
    image: "/jets/su-30-mkk.webp",
  },
];

/** The entry the dialog opens on. Falls back to the first so the picker can
 *  never open with nothing chosen, even if the default flag is lost. */
export const defaultJet = jets.find((jet) => jet.isDefault) ?? jets[0];
