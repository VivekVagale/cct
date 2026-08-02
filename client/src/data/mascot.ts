/**
 * The mascot is a permanent brand asset. These images are never
 * redesigned, recolored, or restyled — only positioned and animated
 * (breathing, floating, parallax) by the Mascot component.
 *
 * Cut out of their black-background renders by tools/cutout_poses.py.
 */
export const MASCOT_POSES = {
  neutral: "/mascot/neutral.png",
  pointing: "/mascot/pointing.png",
  armsCrossed: "/mascot/arms-crossed.png",
  sideCloseUp: "/mascot/side-close-up.png",
  fistPump: "/mascot/fist-pump.png",
  clapperboard: "/mascot/clapperboard.png",
  laptop: "/mascot/laptop.png",
  thumbsUp: "/mascot/thumbs-up.png",
  projectReady: "/mascot/project-ready.png",
  thankYou: "/mascot/thank-you.png",
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;
