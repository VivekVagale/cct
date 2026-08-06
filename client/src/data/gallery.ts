import type { AccordionGalleryItem } from "@/components/AccordionGallery";

/**
 * The strip that opens What We Build.
 *
 * Placeholders until the real set arrives — these are the sphere's renders,
 * which are the only portrait-ish frames on the site today.
 *
 * **Shape the replacements 3:4 portrait, around 1200x1600.** The gallery gives
 * every panel the same height and splits the width between them, so one image
 * has to survive two very different crops: a tall sliver while its panel is
 * closed, and something near square while it is open. It is `object-fit:
 * cover`, so nothing distorts — but everything outside the centre column is
 * gone in the closed state. Keep the subject centred, and keep anything that
 * matters away from the left and right edges.
 */
export const galleryItems: AccordionGalleryItem[] = [
  { image: "/showcase/it-say-grrr.webp", label: "Free Fall" },
  { image: "/showcase/project-jet-mist.webp", label: "Jet Mist" },
  { image: "/showcase/project-re-9.webp", label: "RE 9" },
];
