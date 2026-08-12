export interface ShowcaseItem {
  /** Shown on the focused disc. */
  title: string;
  /** The second line. Category today; a real caption when there is one. */
  category: string;
  /** Only where it is genuinely known — never inferred from the frame. */
  vehicle?: string;
  image: string;
  /** Where the square crop is taken from a taller source. Unused here: these
   *  are already square, so there is nothing to choose. */
  focusY?: number;
}

/*
 * The sphere's discs: 37 frames from the studio's own work.
 *
 * The sphere has 42 disc positions — a once-subdivided icosahedron — so at 37
 * almost every disc is a different frame, and the greedy colouring in
 * InfiniteMenu can place them with no two identical frames adjacent. The
 * twelve it replaces had to repeat three or four times each.
 *
 * Every frame is titled from the frame itself. None still carries its source
 * number, and the "Selected Work" placeholder category is gone with them.
 *
 * `vehicle` is filled in only where a badge is actually legible in the shot —
 * the Interceptor's side panel, the Guerrilla's tank, the Himalayan's, the
 * Classic's and the Meteor's cases. The rest are left blank rather than
 * inferred from a silhouette, which is the same rule the previous set followed
 * and the reason this site's captions can be trusted. The Skoda carries a vRS
 * badge and the winged arrow, and nothing that names the model, so it is filed
 * under what it actually says.
 *
 * The categories are the three scenes these come from: machines suspended above
 * the cloud deck with jets, a night airfield, and the close detail work.
 */
export const showcaseItems: ShowcaseItem[] = [
  {
    title: "Sling Load",
    category: "Aerial",
    image: "/showcase/f-0001.webp",
  },
  {
    title: "Above the Weather",
    category: "Aerial",
    image: "/showcase/f-0148.webp",
  },
  {
    title: "Interceptor, Close",
    category: "Detail",
    vehicle: "Royal Enfield Interceptor 650",
    image: "/showcase/f-0153.webp",
  },
  /* Was "Escort", for the two aircraft flanking the machine, and renamed at the
     studio's word when the build went back to Jet Mist. It is a different
     picture from that card's — the card is the wet-tarmac frame — so this is a
     matter of vocabulary rather than of the two being the same shot. Still
     titled from the frame: the haze off the cloud deck is the other thing in
     it. */
  {
    title: "Mist",
    category: "Aerial",
    image: "/showcase/f-0156.webp",
  },
  {
    title: "Moonrise on the Apron",
    category: "Night",
    image: "/showcase/f-0164.webp",
  },
  {
    title: "Formation",
    category: "Aerial",
    image: "/showcase/f-0168.webp",
  },
  {
    title: "Sedan, Airborne",
    category: "Aerial",
    image: "/showcase/f-0185.webp",
  },
  {
    title: "Standoff",
    category: "Night",
    image: "/showcase/f-0192.webp",
  },
  {
    title: "Chrome at Dusk",
    category: "Detail",
    image: "/showcase/f-0242.webp",
  },
  {
    title: "Perched",
    category: "Aerial",
    image: "/showcase/f-0255.webp",
  },
  {
    title: "Wing Rider",
    category: "Aerial",
    image: "/showcase/f-0262.webp",
  },
  {
    title: "Guerrilla, Backlit",
    category: "Detail",
    vehicle: "Royal Enfield Guerrilla 450",
    image: "/showcase/f-0268.webp",
  },
  {
    title: "Grounded",
    category: "Night",
    image: "/showcase/f-0273.webp",
  },
  {
    title: "Between the Wings",
    category: "Aerial",
    image: "/showcase/f-0275.webp",
  },
  {
    title: "Himalayan, Golden Hour",
    category: "Aerial",
    vehicle: "Royal Enfield Himalayan",
    image: "/showcase/f-0276.webp",
  },
  {
    title: "Himalayan, Wing Deck",
    category: "Aerial",
    vehicle: "Royal Enfield Himalayan",
    image: "/showcase/f-0284.webp",
  },
  {
    title: "Blue Rim",
    category: "Detail",
    image: "/showcase/f-0298.webp",
  },
  {
    title: "Spokes, Golden Hour",
    category: "Detail",
    image: "/showcase/f-0299.webp",
  },
  {
    title: "Disc Over the Peaks",
    category: "Detail",
    image: "/showcase/f-0302.webp",
  },
  {
    title: "Blue Lights, Wet Tarmac",
    category: "Night",
    image: "/showcase/f-0314.webp",
  },
  {
    title: "Gold Caliper",
    category: "Detail",
    image: "/showcase/f-0318.webp",
  },
  {
    title: "Bilstein, Above the Deck",
    category: "Detail",
    image: "/showcase/f-0350.webp",
  },
  {
    title: "vRS, Airborne",
    category: "Aerial",
    vehicle: "Skoda vRS",
    image: "/showcase/f-0415.webp",
  },
  {
    title: "British Racing Green",
    category: "Detail",
    image: "/showcase/f-0442.webp",
  },
  {
    title: "Red Over Black",
    category: "Detail",
    image: "/showcase/f-0443.webp",
  },
  {
    title: "Classic 350, Cases",
    category: "Detail",
    vehicle: "Royal Enfield Classic 350",
    image: "/showcase/f-0463.webp",
  },
  {
    title: "Made Like a Gun",
    category: "Detail",
    image: "/showcase/f-0470.webp",
  },
  {
    title: "Interceptor, Badged",
    category: "Detail",
    vehicle: "Royal Enfield Interceptor 650",
    image: "/showcase/f-0475.webp",
  },
  {
    title: "Himalayan, Low Sun",
    category: "Detail",
    vehicle: "Royal Enfield Himalayan",
    image: "/showcase/f-0481.webp",
  },
  {
    title: "Himalayan, Bone White",
    category: "Detail",
    vehicle: "Royal Enfield Himalayan",
    image: "/showcase/f-0486.webp",
  },
  {
    title: "Skull and Scrollwork",
    category: "Detail",
    image: "/showcase/f-0507.webp",
  },
  {
    title: "Pulled Over",
    category: "Night",
    image: "/showcase/f-0511.webp",
  },
  {
    title: "Interceptor, Orange",
    category: "Detail",
    vehicle: "Royal Enfield Interceptor 650",
    image: "/showcase/f-0514.webp",
  },
  {
    title: "Guerrilla 450, Tank",
    category: "Detail",
    vehicle: "Royal Enfield Guerrilla 450",
    image: "/showcase/f-0518.webp",
  },
  {
    title: "Meteor 350, Panel",
    category: "Detail",
    vehicle: "Royal Enfield Meteor 350",
    image: "/showcase/f-0526.webp",
  },
  {
    title: "Rear Quarter, Dusk",
    category: "Night",
    image: "/showcase/f-0564.webp",
  },
  {
    title: "Roundel at Last Light",
    category: "Night",
    image: "/showcase/f-0600.webp",
  },
];
