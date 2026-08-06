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
 * Thirteen are titled from the frames themselves; the rest still carry their
 * source frame number and want the same treatment.
 *
 * `vehicle` is filled in only where a badge is actually legible in the shot —
 * the Interceptor's tank, the Guerrilla's, the Himalayan's fork. The rest are
 * left blank rather than inferred from a silhouette, which is the same rule the
 * previous set followed and the reason this site's captions can be trusted.
 *
 * The categories are the three scenes these come from: machines suspended above
 * the cloud deck with jets, a night airfield, and the close detail work.
 */
export const showcaseItems: ShowcaseItem[] = [
  {
    title: "Frame 0001",
    category: "Selected Work",
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
  {
    title: "Escort",
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
    title: "Frame 0275",
    category: "Selected Work",
    image: "/showcase/f-0275.webp",
  },
  {
    title: "Himalayan, Golden Hour",
    category: "Aerial",
    vehicle: "Royal Enfield Himalayan",
    image: "/showcase/f-0276.webp",
  },
  {
    title: "Frame 0284",
    category: "Selected Work",
    image: "/showcase/f-0284.webp",
  },
  {
    title: "Frame 0298",
    category: "Selected Work",
    image: "/showcase/f-0298.webp",
  },
  {
    title: "Frame 0299",
    category: "Selected Work",
    image: "/showcase/f-0299.webp",
  },
  {
    title: "Frame 0302",
    category: "Selected Work",
    image: "/showcase/f-0302.webp",
  },
  {
    title: "Frame 0314",
    category: "Selected Work",
    image: "/showcase/f-0314.webp",
  },
  {
    title: "Frame 0318",
    category: "Selected Work",
    image: "/showcase/f-0318.webp",
  },
  {
    title: "Frame 0350",
    category: "Selected Work",
    image: "/showcase/f-0350.webp",
  },
  {
    title: "Frame 0415",
    category: "Selected Work",
    image: "/showcase/f-0415.webp",
  },
  {
    title: "Frame 0442",
    category: "Selected Work",
    image: "/showcase/f-0442.webp",
  },
  {
    title: "Frame 0443",
    category: "Selected Work",
    image: "/showcase/f-0443.webp",
  },
  {
    title: "Frame 0463",
    category: "Selected Work",
    image: "/showcase/f-0463.webp",
  },
  {
    title: "Frame 0470",
    category: "Selected Work",
    image: "/showcase/f-0470.webp",
  },
  {
    title: "Frame 0475",
    category: "Selected Work",
    image: "/showcase/f-0475.webp",
  },
  {
    title: "Frame 0481",
    category: "Selected Work",
    image: "/showcase/f-0481.webp",
  },
  {
    title: "Frame 0486",
    category: "Selected Work",
    image: "/showcase/f-0486.webp",
  },
  {
    title: "Frame 0507",
    category: "Selected Work",
    image: "/showcase/f-0507.webp",
  },
  {
    title: "Frame 0511",
    category: "Selected Work",
    image: "/showcase/f-0511.webp",
  },
  {
    title: "Frame 0514",
    category: "Selected Work",
    image: "/showcase/f-0514.webp",
  },
  {
    title: "Frame 0518",
    category: "Selected Work",
    image: "/showcase/f-0518.webp",
  },
  {
    title: "Frame 0526",
    category: "Selected Work",
    image: "/showcase/f-0526.webp",
  },
  {
    title: "Frame 0564",
    category: "Selected Work",
    image: "/showcase/f-0564.webp",
  },
  {
    title: "Frame 0600",
    category: "Selected Work",
    image: "/showcase/f-0600.webp",
  },
];
