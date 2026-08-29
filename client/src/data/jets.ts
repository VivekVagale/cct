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
 * `Spitfire — Aces High` wears Iron Maiden's artwork, mascot and all, and this
 * is a paid option on a commercial page rather than a personal build. The
 * studio chose the livery knowing what it is. Noted here because whoever reads
 * this file next should not have to work out whether anyone had noticed.
 *
 * One frame is deliberately absent and has been through two names. It came as
 * `SPITFIRE 7370 IRON`, and came back as `SPITFIRE ZIRKUS ROSARIUS` -- the
 * same file to the byte, and the second name is the accurate one: Zirkus
 * Rosarius flew captured Allied aircraft in German markings, which is what
 * this is. It carries a swastika on the tail fin, and renaming a file does not
 * touch what is painted on the aircraft. It is not in the repository and there
 * is no entry for it here; there was one briefly, under a wrong identification
 * of the airframe, and the studio has since had it removed. A re-render
 * without the marking is one file and one line.
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

/* Default first, then alphabetical by name, reading the dash in a livery name
   as if it were not there -- that keeps the four Spitfires together, which is
   what someone scanning fifteen cards is actually looking for. The default
   leads because it is what the picker opens on and what the line under the
   grid prices everything against. */
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
  /* The C-17 Globemaster was here and is not any more.

     It is the aircraft the Premium build drops the machine out of, offered
     there as a delivery rather than as an escort. Listing it here as well
     would put the same aeroplane in the form twice, answering two different
     questions, and a client picking it off this grid would be asking for a
     cargo plane to fly alongside them — which is not a thing this studio
     sells and not what the frame shows.

     `/jets/c-17-globemaster.webp` is left in place; it is the studio's own
     render and nothing else points at it. */
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
    id: "fa-18f-super-hornet",
    name: "F/A-18F Super Hornet",
    image: "/jets/fa-18f-super-hornet.webp",
  },
  {
    id: "hal-tejas",
    name: "HAL Tejas",
    image: "/jets/hal-tejas.webp",
  },
  {
    id: "mig-21-bison",
    name: "MiG-21 Bison",
    image: "/jets/mig-21-bison.webp",
  },
  {
    id: "spitfire-aces-high",
    name: "Spitfire — Aces High",
    image: "/jets/spitfire-aces-high.webp",
  },
  {
    id: "spitfire-mk-iia",
    name: "Spitfire Mk IIa",
    image: "/jets/spitfire-mk-iia.webp",
  },
  {
    id: "spitfire-mk-ixe",
    name: "Spitfire Mk IXe",
    image: "/jets/spitfire-mk-ixe.webp",
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
  {
    id: "yakovlev-yak-3",
    name: "Yakovlev Yak-3",
    image: "/jets/yakovlev-yak-3.webp",
  },
];

/** The entry the dialog opens on. Falls back to the first so the picker can
 *  never open with nothing chosen, even if the default flag is lost. */
export const defaultJet = jets.find((jet) => jet.isDefault) ?? jets[0];
