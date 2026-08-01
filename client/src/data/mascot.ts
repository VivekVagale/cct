/**
 * The mascot is a permanent brand asset. These images are never
 * redesigned, recolored, or restyled — only positioned and animated
 * (breathing, floating, parallax) by the Mascot component.
 */
export const MASCOT_POSES = {
  neutral: "/mascot/neutral.jpg",
  pointing: "/mascot/pointing.jpg",
  armsCrossed: "/mascot/arms-crossed.jpg",
  thinking: "/mascot/thinking.jpg",
  fistPump: "/mascot/fist-pump.jpg",
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;
