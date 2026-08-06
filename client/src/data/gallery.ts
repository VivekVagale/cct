import type { AccordionGalleryItem } from "@/components/AccordionGallery";

/**
 * The strip that opens What We Build: one scene, three stages of building it.
 *
 * Viewport captures from the studio's own file rather than finished frames —
 * the same jet, pursuit car and motorcycle in each, from wireframe through to
 * lit. That progression is the argument the section is making, and it is one
 * only a studio that actually built the thing can show.
 *
 * The images are square, where 3:4 portrait would suit the panels better. It
 * costs a harder horizontal crop while a panel is closed: the gallery gives
 * every panel the same height and splits the width between them, so a closed
 * one is a tall sliver and `object-fit: cover` takes it from the centre. The
 * subject sits centre-frame in all three, so what is lost at the edges is
 * background.
 */
export const galleryItems: AccordionGalleryItem[] = [
  { image: "/gallery/modelling.webp", label: "Modelling" },
  { image: "/gallery/shading.webp", label: "Shading" },
  { image: "/gallery/lighting.webp", label: "Lighting" },
];
