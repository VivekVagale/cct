export interface Project {
  title: string;
  description: string;
  image: string;
}

/**
 * Add future projects here — the grid and cards pick up new
 * entries automatically, no component changes needed.
 */
export const projects: Project[] = [
  {
    title: 'Bike Free Falling',
    description: 'Cinematic motorcycle CGI with dynamic motion and premium lighting setup.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  },
  {
    title: 'Jet Shot',
    description: 'High-speed automotive CGI capturing motion and luxury aesthetics.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  },
];
