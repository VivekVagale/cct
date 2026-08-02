export interface VehicleColor {
  id: string;
  name: string;
  image: string;
  /** Swatch shown on the color card and selector chip. */
  swatch: string;
}

export interface Vehicle {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  colors: VehicleColor[];
}

// NOTE: color variants currently reuse the vehicle's cover photo since
// we don't have per-color studio renders yet. Swap each color's `image`
// for a real color-specific shot as they become available — nothing
// else needs to change, the configurator is fully data-driven.

export const vehicles: Vehicle[] = [
  {
    id: "himalayan-450",
    name: "Himalayan 450",
    manufacturer: "Royal Enfield",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1400&auto=format&fit=crop",
    colors: [
      {
        id: "kamet-white",
        name: "Kamet White",
        swatch: "#EDEFF2",
        image:
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "kaza-brown",
        name: "Kaza Brown",
        swatch: "#6B4A34",
        image:
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "hanle-black",
        name: "Hanle Black",
        swatch: "#15171B",
        image:
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "gt-650",
    name: "GT 650",
    manufacturer: "Royal Enfield",
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1400&auto=format&fit=crop",
    colors: [
      {
        id: "ventura-blue",
        name: "Ventura Blue",
        swatch: "#2C4A6E",
        image:
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "racing-green",
        name: "Racing Green",
        swatch: "#22362A",
        image:
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "mist-grey",
        name: "Mist Grey",
        swatch: "#9AA1A8",
        image:
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "zx-6r",
    name: "ZX-6R",
    manufacturer: "Kawasaki",
    image:
      "https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?q=80&w=1400&auto=format&fit=crop",
    colors: [
      {
        id: "lime-green",
        name: "Lime Green",
        swatch: "#3D5A1F",
        image:
          "https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "metallic-graphite",
        name: "Metallic Graphite",
        swatch: "#2B2E33",
        image:
          "https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?q=80&w=1400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "hayabusa",
    name: "Hayabusa",
    manufacturer: "Suzuki",
    image:
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1400&auto=format&fit=crop",
    colors: [
      {
        id: "glass-sparkle-black",
        name: "Glass Sparkle Black",
        swatch: "#111214",
        image:
          "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "pearl-brilliant-white",
        name: "Pearl Brilliant White",
        swatch: "#E8EAED",
        image:
          "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "candy-burnt-gold",
        name: "Candy Burnt Gold",
        swatch: "#7A5A2E",
        image:
          "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ninja-650",
    name: "Ninja 650",
    manufacturer: "Kawasaki",
    image:
      "https://images.unsplash.com/photo-1558981396-5fcf84bdf14d?q=80&w=1400&auto=format&fit=crop",
    colors: [
      {
        id: "pearl-robotic-white",
        name: "Pearl Robotic White",
        swatch: "#E9EBEE",
        image:
          "https://images.unsplash.com/photo-1558981396-5fcf84bdf14d?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "metallic-matte-graphenesteel-grey",
        name: "Graphenesteel Grey",
        swatch: "#3A3D42",
        image:
          "https://images.unsplash.com/photo-1558981396-5fcf84bdf14d?q=80&w=1400&auto=format&fit=crop",
      },
    ],
  },
];
