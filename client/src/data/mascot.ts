/**
 * The mascot is a permanent brand asset. These images are never
 * redesigned, recolored, or restyled — only positioned and animated
 * (breathing, floating, parallax) by the Mascot component.
 */
export const MASCOT_POSES = {
  neutral: "/mascot/neutral.png",
  pointing: "/mascot/pointing.png",
  armsCrossed: "/mascot/arms-crossed.png",
  thinking: "/mascot/thinking.png",
  fistPump: "/mascot/fist-pump.png",
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;
