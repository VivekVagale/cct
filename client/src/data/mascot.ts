/**
 * The mascot is a permanent brand asset. These images are never
 * redesigned, recolored, or restyled — only positioned and animated
 * (breathing, floating, parallax) by the Mascot component.
 *
 * Cut out of their black-background renders by tools/cutout_poses.py.
 *
 * Four of these files used to be named after a pose they did not contain:
 * arms-crossed and fist-pump held each other's render, thumbs-up held the side
 * close-up, and side-close-up held a second, tighter pointing frame. The files
 * were renamed to what they actually show rather than the keys remapped, so a
 * future render drop can be checked against the folder by eye. There is no
 * thumbs-up render, and the key that assumed one is gone.
 *
 * Every key here is the pose in the image. Look at a new file before adding it.
 */
export const MASCOT_POSES = {
  neutral: "/mascot/neutral.webp",
  pointing: "/mascot/pointing.webp",
  /** Spare. The pointing pose again, cropped to the forearm. Unused. */
  pointingClose: "/mascot/pointing-close.webp",
  armsCrossed: "/mascot/arms-crossed.webp",
  sideCloseUp: "/mascot/side-close-up.webp",
  fistPump: "/mascot/fist-pump.webp",
  clapperboard: "/mascot/clapperboard.webp",
  laptop: "/mascot/laptop.webp",
  projectReady: "/mascot/project-ready.webp",
  thankYou: "/mascot/thank-you.webp",
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;
