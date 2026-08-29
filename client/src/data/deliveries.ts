/**
 * How the machine gets to the drop, on a Free Fall Premium build.
 *
 * Two of them, and the price is the same either way -- this is a choice of
 * shot, not a tier inside a tier. That matters enough to be said in the dialog
 * as well: the jets grid two sections up carries a line about a surcharge for
 * anything other than the studio default, and a second thumbnail picker right
 * under it would inherit that reading unless it says otherwise.
 *
 * Same `image?` shape as `Jet` and `Environment`, for the same reason: an
 * option with no frame yet draws `PendingRender` rather than standing in
 * something that is not the studio's work. Both have one, so nothing draws it
 * today.
 *
 * Only the Premium build asks this. Standard Free Fall drops out of an
 * aircraft the client picks from the jets grid, which is a different question
 * with a different answer -- see BUILD_BRIEFS.
 */
export interface Delivery {
  id: string;
  name: string;
  hint?: string;
  image?: string;
  /**
   * What the dialog opens on. Exactly one entry carries it.
   *
   * Flagged rather than taken as `deliveries[0]` so the default survives
   * someone reordering the list, the way `defaultJet` and `defaultEnvironment`
   * already do.
   */
  isDefault?: boolean;
}

export const deliveries: Delivery[] = [
  {
    id: "globemaster",
    name: "Globemaster Drop",
    hint: "Out the back of a C-17",
    /* The same frame the Premium card is cut from, so the build a client picked
       and the option the dialog opens on are one picture rather than two.

       A tighter square than the card takes, because this is drawn at chip size
       and the card's wider view of the same shot loses the machine at that
       scale. The card window is 4:3 and object-covers, so the top and bottom
       eighth of this square are clipped before anyone sees them — the crop is
       set with the machine inside that middle band, not merely inside the
       square. */
    image: "/deliveries/globemaster.webp",
    isDefault: true,
  },
  {
    id: "chopper",
    name: "Chopper Lift",
    hint: "Slung under a Mi-24",
    image: "/deliveries/chopper.webp",
  },
];

/** The entry the dialog opens on, resolved the way `defaultJet` is. */
export const defaultDelivery =
  deliveries.find((delivery) => delivery.isDefault) ?? deliveries[0];
