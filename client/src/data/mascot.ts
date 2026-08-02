/**
 * The mascot is a permanent brand asset. These images are never
 * redesigned, recolored, or restyled — only positioned and animated
 * (breathing, floating, parallax) by the Mascot component.
 *
 * Cut out of their black-background renders by tools/cutout_poses.py.
 */
export const MASCOT_POSES = {
  neutral: "/mascot/neutral.webp",
  pointing: "/mascot/pointing.webp",
  armsCrossed: "/mascot/arms-crossed.webp",
  sideCloseUp: "/mascot/side-close-up.webp",
  fistPump: "/mascot/fist-pump.webp",
  clapperboard: "/mascot/clapperboard.webp",
  laptop: "/mascot/laptop.webp",
  thumbsUp: "/mascot/thumbs-up.webp",
  projectReady: "/mascot/project-ready.webp",
  thankYou: "/mascot/thank-you.webp",
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;
