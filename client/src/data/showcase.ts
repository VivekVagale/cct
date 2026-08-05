export interface ShowcaseItem {
  id: string;
  title: string;
  vehicle: string;
  category: string;
  year: string;
  description: string;
  image: string;
  /**
   * Where the sphere takes its square crop from, vertically. 0 top, 1 bottom,
   * omitted means the middle.
   *
   * The discs are circles cut from a square, so a 9:16 export loses 44% of its
   * height before it is even masked. Set this per image rather than
   * re-exporting: a bike low in a reel frame wants about 0.65, a helmet high in
   * one wants about 0.3.
   */
  focusY?: number;
}

export const showcaseItems: ShowcaseItem[] = [
  {
    id: "midnight-run",
    title: "Midnight Run",
    vehicle: "Ducati Panigale V4",
    category: "Cinematic Render",
    year: "2026",
    description:
      "A single unbroken shot through a rain-lit tunnel, built frame by frame to feel handheld — every reflection calculated, nothing filmed.",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "salt-flat-silence",
    title: "Salt Flat Silence",
    vehicle: "Porsche 911 Turbo S",
    category: "Environment CGI",
    year: "2026",
    description:
      "Stillness as spectacle. A dry lakebed at golden hour, built to make the car the only thing that moves in frame.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "vertical-hold",
    title: "Vertical Hold",
    vehicle: "KTM 1290 Super Duke",
    category: "Motion Study",
    year: "2025",
    description:
      "A free-fall sequence choreographed to the millisecond — suspension travel, weight transfer, and light all simulated from first principles.",
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "glasshouse",
    title: "Glasshouse",
    vehicle: "Mercedes-AMG GT",
    category: "Studio CGI",
    year: "2025",
    description:
      "A controlled studio build with no physical set — every panel, every rim of light, placed by hand until it read as real.",
    image:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "low-tide",
    title: "Low Tide",
    vehicle: "BMW M1000RR",
    category: "Water Impact",
    year: "2025",
    description:
      "The exact moment a wheel breaks the surface, held for a beat longer than physics would allow — cinema over accuracy, on purpose.",
    image:
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1600&auto=format&fit=crop",
  },
];
