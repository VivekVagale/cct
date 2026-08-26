export interface VehicleColor {
  id: string;
  name: string;
  /**
   * What loads today.
   *
   * There was a PLACEHOLDER constant here — one of the studio's own frames,
   * shown by every colourway that had no render of its own. Every colourway has
   * one now, so it is gone. The field stays separate from `render` because the
   * two still mean different things: one machine shares another colourway's shot
   * where the paint is genuinely the same, and a colour added tomorrow will want
   * something to point at before its render exists.
   */
  image: string;
  /**
   * Where this colourway's own render belongs.
   *
   * Drop a file at this path and switch `image` to `render` — that is the whole
   * migration, one line per colour or a single pass over the array. Kept
   * separate rather than pointed at directly so the configurator never ships
   * broken images while the renders are being made.
   */
  render: string;
  /** Swatch shown on the color card and selector chip. */
  swatch: string;
  /**
   * A colourway the studio has not rendered yet.
   *
   * It is still offered — a client picking one is telling us what they want —
   * but it is the difference between a shot that exists and one that will be
   * built, and the configurator says so rather than letting the two look alike.
   */
  pending?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  /** Where this machine's cover render belongs. See VehicleColor.render. */
  render: string;
  /**
   * A machine the studio has not rendered yet.
   *
   * True only where no colourway has a shot — a machine with one render has a
   * cover. `image` and `render` still carry the path the cover will live at, so
   * dropping the file in and deleting this line is the whole migration; nothing
   * requests either path while this is set.
   */
  pending?: boolean;
  colors: VehicleColor[];
}

/*
 * The machines the studio works with, as supplied: the Royal Enfield range, and
 * whatever else has been added since.
 *
 * Every colourway now has its own card render, at
 * `/vehicles/<machine>/<colour>.webp`, 4:3 and WebP. One thing about this data
 * is still inferred, and it is not hidden:
 *
 * **The swatch hexes are inferred from the colour names**, not sampled from the
 * paint. "Kaza Brown" is a brown, "Tokyo Black" is a black, and a name with no
 * hue in it at all — Two Four Nine, Mark 2, Dux Deluxe — gets a neutral. They
 * are close enough to tell one chip from another and are not accurate enough to
 * choose a colour from. The renders exist now, so they can be sampled.
 */
export const vehicles: Vehicle[] = [
  {
    id: "himalayan-450",
    name: "Himalayan 450",
    manufacturer: "Royal Enfield",
    render: "/vehicles/himalayan-450/cover.webp",
        image: "/vehicles/himalayan-450/cover.webp",
    colors: [
      {
        id: "kamet-white",
        name: "Kamet White",
        swatch: "#EDEFF2",
        render: "/vehicles/himalayan-450/kamet-white.webp",
        image: "/vehicles/himalayan-450/kamet-white.webp",
      },
      {
        id: "kaza-brown",
        name: "Kaza Brown",
        swatch: "#5E4230",
        render: "/vehicles/himalayan-450/kaza-brown.webp",
        image: "/vehicles/himalayan-450/kaza-brown.webp",
      },
      {
        id: "hanle-black",
        name: "Hanle Black",
        swatch: "#14161A",
        render: "/vehicles/himalayan-450/hanle-black.webp",
        image: "/vehicles/himalayan-450/hanle-black.webp",
      },
      {
        id: "slate-poppy-blue",
        name: "Slate Poppy Blue",
        swatch: "#C4453C",
        render: "/vehicles/himalayan-450/slate-poppy-blue.webp",
        image: "/vehicles/himalayan-450/slate-poppy-blue.webp",
      },
      {
        id: "slate-himalayan-salt",
        name: "Slate Himalayan Salt",
        swatch: "#6E7378",
        render: "/vehicles/himalayan-450/slate-himalayan-salt.webp",
        image: "/vehicles/himalayan-450/slate-himalayan-salt.webp",
      },
    ],
  },
  {
    id: "hunter-350",
    name: "Hunter 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/hunter-350/cover.webp",
        image: "/vehicles/hunter-350/cover.webp",
    colors: [
      {
        id: "london-red",
        name: "London Red",
        swatch: "#A32330",
        render: "/vehicles/hunter-350/london-red.webp",
        image: "/vehicles/hunter-350/london-red.webp",
      },
      {
        id: "rio-white",
        name: "Rio White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/rio-white.webp",
        image: "/vehicles/hunter-350/rio-white.webp",
      },
      {
        id: "tokyo-black",
        name: "Tokyo Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/tokyo-black.webp",
        image: "/vehicles/hunter-350/tokyo-black.webp",
      },
      {
        id: "dapper-white",
        name: "Dapper White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/dapper-white.webp",
        image: "/vehicles/hunter-350/dapper-white.webp",
      },
      {
        id: "moonshot-white",
        name: "Moonshot White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/moonshot-white.webp",
        image: "/vehicles/hunter-350/moonshot-white.webp",
      },
      {
        id: "mumbai-yellow",
        name: "Mumbai Yellow",
        swatch: "#D8A62A",
        render: "/vehicles/hunter-350/mumbai-yellow.webp",
        image: "/vehicles/hunter-350/mumbai-yellow.webp",
      },
      {
        id: "tarmac-black",
        name: "Tarmac Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/tarmac-black.webp",
        image: "/vehicles/hunter-350/tarmac-black.webp",
      },
      {
        id: "graphite-grey",
        name: "Graphite Grey",
        swatch: "#6E7378",
        render: "/vehicles/hunter-350/graphite-grey.webp",
        image: "/vehicles/hunter-350/graphite-grey.webp",
      },
      {
        id: "dapper-grey",
        name: "Dapper Grey",
        swatch: "#6E7378",
        render: "/vehicles/hunter-350/dapper-grey.webp",
        image: "/vehicles/hunter-350/dapper-grey.webp",
      },
      {
        id: "factory-black",
        name: "Factory Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/factory-black.webp",
        image: "/vehicles/hunter-350/factory-black.webp",
      },
      {
        id: "rebel-blue",
        name: "Rebel Blue",
        swatch: "#22406E",
        render: "/vehicles/hunter-350/rebel-blue.webp",
        image: "/vehicles/hunter-350/rebel-blue.webp",
      },
      {
        id: "rebel-red",
        name: "Rebel Red",
        swatch: "#A32330",
        render: "/vehicles/hunter-350/rebel-red.webp",
        image: "/vehicles/hunter-350/rebel-red.webp",
      },
      {
        id: "rebel-black",
        name: "Rebel Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/rebel-black.webp",
        image: "/vehicles/hunter-350/rebel-black.webp",
      },
      {
        id: "dapper-green",
        name: "Dapper Green",
        swatch: "#25543B",
        render: "/vehicles/hunter-350/dapper-green.webp",
        image: "/vehicles/hunter-350/dapper-green.webp",
      },
    ],
  },
  {
    id: "guerrilla-450",
    name: "Guerrilla 450",
    manufacturer: "Royal Enfield",
    render: "/vehicles/guerrilla-450/cover.webp",
        image: "/vehicles/guerrilla-450/cover.webp",
    colors: [
      {
        id: "apex-black",
        name: "Apex Black",
        swatch: "#14161A",
        render: "/vehicles/guerrilla-450/apex-black.webp",
        image: "/vehicles/guerrilla-450/apex-black.webp",
      },
      {
        id: "apex-green",
        name: "Apex Green",
        swatch: "#25543B",
        render: "/vehicles/guerrilla-450/apex-green.webp",
        image: "/vehicles/guerrilla-450/apex-green.webp",
      },
      {
        id: "apex-red",
        name: "Apex Red",
        swatch: "#A32330",
        render: "/vehicles/guerrilla-450/apex-red.webp",
        image: "/vehicles/guerrilla-450/apex-red.webp",
      },
      {
        id: "brava-blue",
        name: "Brava Blue",
        swatch: "#22406E",
        render: "/vehicles/guerrilla-450/brava-blue.webp",
        image: "/vehicles/guerrilla-450/brava-blue.webp",
      },
      {
        id: "smoke-silver",
        name: "Smoke Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/guerrilla-450/smoke-silver.webp",
        image: "/vehicles/guerrilla-450/smoke-silver.webp",
      },
      {
        id: "shadow-ash",
        name: "Shadow Ash",
        swatch: "#B9BCC0",
        render: "/vehicles/guerrilla-450/shadow-ash.webp",
        image: "/vehicles/guerrilla-450/shadow-ash.webp",
      },
      {
        id: "twilight-blue",
        name: "Twilight Blue",
        swatch: "#22406E",
        render: "/vehicles/guerrilla-450/twilight-blue.webp",
        image: "/vehicles/guerrilla-450/twilight-blue.webp",
      },
      {
        id: "gold-dip",
        name: "Gold Dip",
        swatch: "#B08A3C",
        render: "/vehicles/guerrilla-450/gold-dip.webp",
        image: "/vehicles/guerrilla-450/gold-dip.webp",
      },
      {
        id: "peix-bronze",
        name: "Peix Bronze",
        swatch: "#8A6A3B",
        render: "/vehicles/guerrilla-450/peix-bronze.webp",
        image: "/vehicles/guerrilla-450/peix-bronze.webp",
      },
    ],
  },
  {
    id: "bear-650",
    name: "Bear 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/bear-650/cover.webp",
        image: "/vehicles/bear-650/cover.webp",
    colors: [
      {
        id: "boardwalk-white",
        name: "Boardwalk White",
        swatch: "#EDEFF2",
        render: "/vehicles/bear-650/boardwalk-white.webp",
        image: "/vehicles/bear-650/boardwalk-white.webp",
      },
      {
        id: "golden-shadow",
        name: "Golden Shadow",
        swatch: "#B08A3C",
        render: "/vehicles/bear-650/golden-shadow.webp",
        image: "/vehicles/bear-650/golden-shadow.webp",
      },
      {
        id: "two-four-nine",
        name: "Two Four Nine",
        swatch: "#6E7378",
        render: "/vehicles/bear-650/two-four-nine.webp",
        image: "/vehicles/bear-650/two-four-nine.webp",
      },
      {
        id: "wild-honey",
        name: "Wild Honey",
        swatch: "#B5822E",
        render: "/vehicles/bear-650/wild-honey.webp",
        image: "/vehicles/bear-650/wild-honey.webp",
      },
      {
        id: "petrol-green",
        name: "Petrol Green",
        swatch: "#25543B",
        render: "/vehicles/bear-650/petrol-green.webp",
        image: "/vehicles/bear-650/petrol-green.webp",
      },
    ],
  },
  {
    id: "classic-350",
    name: "Classic 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-350/cover.webp",
        image: "/vehicles/classic-350/cover.webp",
    colors: [
      {
        id: "emerald",
        name: "Emerald",
        swatch: "#1F6B4A",
        render: "/vehicles/classic-350/emerald.webp",
        image: "/vehicles/classic-350/emerald.webp",
      },
      {
        id: "madras-red",
        name: "Madras Red",
        swatch: "#A32330",
        render: "/vehicles/classic-350/madras-red.webp",
        image: "/vehicles/classic-350/madras-red.webp",
      },
      {
        id: "medallion-bronze",
        name: "Medallion Bronze",
        swatch: "#7A5A34",
        render: "/vehicles/classic-350/medallion-bronze.webp",
        image: "/vehicles/classic-350/medallion-bronze.webp",
      },
      {
        id: "signals-commando-sand",
        name: "Signals Commando Sand",
        swatch: "#B7A283",
        render: "/vehicles/classic-350/signals-commando-sand.webp",
        image: "/vehicles/classic-350/signals-commando-sand.webp",
      },
      {
        id: "stealth-black",
        name: "Stealth Black",
        swatch: "#14161A",
        render: "/vehicles/classic-350/stealth-black.webp",
        image: "/vehicles/classic-350/stealth-black.webp",
      },
      {
        id: "gun-grey",
        name: "Gun Grey",
        swatch: "#6E7378",
        render: "/vehicles/classic-350/gun-grey.webp",
        image: "/vehicles/classic-350/gun-grey.webp",
      },
      {
        id: "ash-white",
        name: "Ash White",
        swatch: "#EDEFF2",
        render: "/vehicles/classic-350/ash-white.webp",
        image: "/vehicles/classic-350/ash-white.webp",
      },
      {
        id: "halcyon-black",
        name: "Halcyon Black",
        swatch: "#14161A",
        render: "/vehicles/classic-350/halcyon-black.webp",
        image: "/vehicles/classic-350/halcyon-black.webp",
      },
      {
        id: "redditch-red",
        name: "Redditch Red",
        swatch: "#A32330",
        render: "/vehicles/classic-350/redditch-red.webp",
        image: "/vehicles/classic-350/redditch-red.webp",
      },
      {
        id: "chrome-bronze",
        name: "Chrome Bronze",
        swatch: "#C9CDD2",
        render: "/vehicles/classic-350/chrome-bronze.webp",
        image: "/vehicles/classic-350/chrome-bronze.webp",
      },
      {
        id: "chrome-red",
        name: "Chrome Red",
        swatch: "#C9CDD2",
        render: "/vehicles/classic-350/chrome-red.webp",
        image: "/vehicles/classic-350/chrome-red.webp",
      },
      {
        id: "halcyon-green",
        name: "Halcyon Green",
        swatch: "#25543B",
        render: "/vehicles/classic-350/halcyon-green.webp",
        image: "/vehicles/classic-350/halcyon-green.webp",
      },
      {
        id: "halcyon-grey",
        name: "Halcyon Grey",
        swatch: "#6E7378",
        render: "/vehicles/classic-350/halcyon-grey.webp",
        image: "/vehicles/classic-350/halcyon-grey.webp",
      },
      {
        id: "jodhpur-blue",
        name: "Jodhpur Blue",
        swatch: "#22406E",
        render: "/vehicles/classic-350/jodhpur-blue.webp",
        image: "/vehicles/classic-350/jodhpur-blue.webp",
      },
      {
        id: "redditch-grey",
        name: "Redditch Grey",
        swatch: "#6E7378",
        render: "/vehicles/classic-350/redditch-grey.webp",
        image: "/vehicles/classic-350/redditch-grey.webp",
      },
    ],
  },
  {
    id: "classic-500",
    name: "Classic 500",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-500/cover.webp",
        image: "/vehicles/classic-500/cover.webp",
    colors: [
      {
        id: "desert-storm",
        name: "Desert Storm",
        swatch: "#5A5F66",
        render: "/vehicles/classic-500/desert-storm.webp",
        image: "/vehicles/classic-500/desert-storm.webp",
      },
      {
        id: "battle-green",
        name: "Battle Green",
        swatch: "#3F4A38",
        render: "/vehicles/classic-500/battle-green.webp",
        image: "/vehicles/classic-500/battle-green.webp",
      },
      {
        id: "squadron-blue",
        name: "Squadron Blue",
        swatch: "#2E4A6B",
        render: "/vehicles/classic-500/squadron-blue.webp",
        image: "/vehicles/classic-500/squadron-blue.webp",
      },
    ],
  },
  {
    id: "classic-650",
    name: "Classic 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-650/cover.webp",
        image: "/vehicles/classic-650/cover.webp",
    colors: [
      {
        id: "black-chrome",
        name: "Black Chrome",
        swatch: "#C9CDD2",
        render: "/vehicles/classic-650/black-chrome.webp",
        image: "/vehicles/classic-650/black-chrome.webp",
      },
      {
        id: "teal",
        name: "Teal",
        swatch: "#1E6E6A",
        render: "/vehicles/classic-650/teal.webp",
        image: "/vehicles/classic-650/teal.webp",
      },
      {
        id: "vallam-red",
        name: "Vallam Red",
        swatch: "#A32330",
        render: "/vehicles/classic-650/vallam-red.webp",
        image: "/vehicles/classic-650/vallam-red.webp",
      },
      {
        id: "bruntingthorpe-blue",
        name: "Bruntingthorpe Blue",
        swatch: "#22406E",
        render: "/vehicles/classic-650/bruntingthorpe-blue.webp",
        image: "/vehicles/classic-650/bruntingthorpe-blue.webp",
      },
    ],
  },
  {
    id: "interceptor-650",
    name: "Interceptor 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/interceptor-650/cover.webp",
        image: "/vehicles/interceptor-650/cover.webp",
    colors: [
      {
        id: "barcelona-blue",
        name: "Barcelona Blue",
        swatch: "#22406E",
        render: "/vehicles/interceptor-650/barcelona-blue.webp",
        image: "/vehicles/interceptor-650/barcelona-blue.webp",
      },
      {
        id: "black-ray",
        name: "Black Ray",
        swatch: "#14161A",
        render: "/vehicles/interceptor-650/black-ray.webp",
        image: "/vehicles/interceptor-650/black-ray.webp",
      },
      {
        id: "sunset-strip",
        name: "Sunset Strip",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/sunset-strip.webp",
        image: "/vehicles/interceptor-650/sunset-strip.webp",
      },
      {
        id: "canyon-red",
        name: "Canyon Red",
        swatch: "#A32330",
        render: "/vehicles/interceptor-650/canyon-red.webp",
        image: "/vehicles/interceptor-650/canyon-red.webp",
      },
      {
        id: "orange-crush",
        name: "Orange Crush",
        swatch: "#C4622A",
        render: "/vehicles/interceptor-650/orange-crush.webp",
        image: "/vehicles/interceptor-650/orange-crush.webp",
      },
      {
        id: "cali-green",
        name: "Cali Green",
        swatch: "#25543B",
        render: "/vehicles/interceptor-650/cali-green.webp",
        image: "/vehicles/interceptor-650/cali-green.webp",
      },
      {
        id: "mark-2",
        name: "Mark 2",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/mark-2.webp",
        image: "/vehicles/interceptor-650/mark-2.webp",
      },
      {
        id: "mark-three",
        name: "Mark Three",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/mark-three.webp",
        image: "/vehicles/interceptor-650/mark-three.webp",
      },
      {
        id: "glitter-and-dust",
        name: "Glitter & Dust",
        swatch: "#9C9384",
        render: "/vehicles/interceptor-650/glitter-and-dust.webp",
        image: "/vehicles/interceptor-650/glitter-and-dust.webp",
      },
      {
        id: "baker-express",
        name: "Baker Express",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/baker-express.webp",
        image: "/vehicles/interceptor-650/baker-express.webp",
      },
      {
        id: "ravishing-red",
        name: "Ravishing Red",
        swatch: "#A32330",
        render: "/vehicles/interceptor-650/ravishing-red.webp",
        image: "/vehicles/interceptor-650/ravishing-red.webp",
      },
      {
        id: "downtown-drag",
        name: "Downtown Drag",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/downtown-drag.webp",
        image: "/vehicles/interceptor-650/downtown-drag.webp",
      },
      {
        id: "black-pearl",
        name: "Black Pearl",
        swatch: "#14161A",
        render: "/vehicles/interceptor-650/black-pearl.webp",
        image: "/vehicles/interceptor-650/black-pearl.webp",
      },
      {
        id: "silver-spectre",
        name: "Silver Spectre",
        swatch: "#C3C7CC",
        render: "/vehicles/interceptor-650/silver-spectre.webp",
        image: "/vehicles/interceptor-650/silver-spectre.webp",
      },
      {
        id: "ventura-blue",
        name: "Ventura Blue",
        swatch: "#22406E",
        render: "/vehicles/interceptor-650/ventura-blue.webp",
        image: "/vehicles/interceptor-650/ventura-blue.webp",
      },
    ],
  },
  {
    id: "continental-gt-650",
    name: "Continental GT 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/continental-gt-650/cover.webp",
        image: "/vehicles/continental-gt-650/cover.webp",
    colors: [
      {
        id: "british-racing-green",
        name: "British Racing Green",
        swatch: "#25543B",
        render: "/vehicles/continental-gt-650/british-racing-green.webp",
        image: "/vehicles/continental-gt-650/british-racing-green.webp",
      },
      {
        id: "mr-clean",
        name: "Mr. Clean",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/mr-clean.webp",
        image: "/vehicles/continental-gt-650/mr-clean.webp",
      },
      {
        id: "slipstream-blue",
        name: "Slipstream Blue",
        swatch: "#22406E",
        render: "/vehicles/continental-gt-650/slipstream-blue.webp",
        image: "/vehicles/continental-gt-650/slipstream-blue.webp",
      },
      {
        id: "apex-grey",
        name: "Apex Grey",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/apex-grey.webp",
        image: "/vehicles/continental-gt-650/apex-grey.webp",
      },
      {
        id: "rocker-red",
        name: "Rocker Red",
        swatch: "#A32330",
        render: "/vehicles/continental-gt-650/rocker-red.webp",
        image: "/vehicles/continental-gt-650/rocker-red.webp",
      },
      {
        id: "dux-deluxe",
        name: "Dux Deluxe",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/dux-deluxe.webp",
        image: "/vehicles/continental-gt-650/dux-deluxe.webp",
      },
      {
        id: "ventura-storm",
        name: "Ventura Storm",
        swatch: "#5A5F66",
        render: "/vehicles/continental-gt-650/ventura-storm.webp",
        image: "/vehicles/continental-gt-650/ventura-storm.webp",
      },
    ],
  },
  {
    id: "super-meteor-650",
    name: "Super Meteor 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/super-meteor-650/cover.webp",
        image: "/vehicles/super-meteor-650/cover.webp",
    colors: [
      {
        id: "astral-black",
        name: "Astral Black",
        swatch: "#14161A",
        render: "/vehicles/super-meteor-650/astral-black.webp",
        image: "/vehicles/super-meteor-650/astral-black.webp",
      },
      {
        id: "celestial-blue",
        name: "Celestial Blue",
        swatch: "#22406E",
        render: "/vehicles/super-meteor-650/celestial-blue.webp",
        image: "/vehicles/super-meteor-650/celestial-blue.webp",
      },
      {
        id: "celestial-red",
        name: "Celestial Red",
        swatch: "#A32330",
        render: "/vehicles/super-meteor-650/celestial-red.webp",
        image: "/vehicles/super-meteor-650/celestial-red.webp",
      },
      {
        id: "interstellar-green",
        name: "Interstellar Green",
        swatch: "#25543B",
        render: "/vehicles/super-meteor-650/interstellar-green.webp",
        image: "/vehicles/super-meteor-650/interstellar-green.webp",
      },
      {
        id: "interstellar-grey",
        name: "Interstellar Grey",
        swatch: "#6E7378",
        render: "/vehicles/super-meteor-650/interstellar-grey.webp",
        image: "/vehicles/super-meteor-650/interstellar-grey.webp",
      },
      {
        id: "astral-blue",
        name: "Astral Blue",
        swatch: "#22406E",
        render: "/vehicles/super-meteor-650/astral-blue.webp",
        image: "/vehicles/super-meteor-650/astral-blue.webp",
      },
      {
        id: "astral-green",
        name: "Astral Green",
        swatch: "#25543B",
        render: "/vehicles/super-meteor-650/astral-green.webp",
        image: "/vehicles/super-meteor-650/astral-green.webp",
      },
    ],
  },
  {
    id: "meteor-350",
    name: "Meteor 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/meteor-350/cover.webp",
        image: "/vehicles/meteor-350/cover.webp",
    colors: [
      {
        id: "stellar-marine-blue",
        name: "Stellar Marine Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/stellar-marine-blue.webp",
        image: "/vehicles/meteor-350/stellar-marine-blue.webp",
      },
      {
        id: "supernova-black",
        name: "Supernova Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/supernova-black.webp",
        image: "/vehicles/meteor-350/supernova-black.webp",
      },
      {
        id: "fireball-grey",
        name: "Fireball Grey",
        swatch: "#6E7378",
        render: "/vehicles/meteor-350/fireball-grey.webp",
        image: "/vehicles/meteor-350/fireball-grey.webp",
      },
      {
        id: "aurora-retro-green",
        name: "Aurora Retro Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/aurora-retro-green.webp",
        image: "/vehicles/meteor-350/aurora-retro-green.webp",
      },
      {
        id: "aurora-red",
        name: "Aurora Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/aurora-red.webp",
        image: "/vehicles/meteor-350/aurora-red.webp",
      },
      {
        id: "stellar-matt-grey",
        name: "Stellar Matt Grey",
        swatch: "#6E7378",
        render: "/vehicles/meteor-350/stellar-matt-grey.webp",
        image: "/vehicles/meteor-350/stellar-matt-grey.webp",
      },
      {
        id: "fireball-orange",
        name: "Fireball Orange",
        swatch: "#C4622A",
        render: "/vehicles/meteor-350/fireball-orange.webp",
        image: "/vehicles/meteor-350/fireball-orange.webp",
      },
      {
        id: "sundowner-orange",
        name: "Sundowner Orange",
        swatch: "#C4622A",
        render: "/vehicles/meteor-350/sundowner-orange.webp",
        image: "/vehicles/meteor-350/sundowner-orange.webp",
      },
      {
        id: "fireball-pure-black",
        name: "Fireball Pure Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/fireball-pure-black.webp",
        image: "/vehicles/meteor-350/fireball-pure-black.webp",
      },
      {
        id: "fireball-matt-green",
        name: "Fireball Matt Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/fireball-matt-green.webp",
        image: "/vehicles/meteor-350/fireball-matt-green.webp",
      },
      {
        id: "fireball-blue",
        name: "Fireball Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/fireball-blue.webp",
        image: "/vehicles/meteor-350/fireball-blue.webp",
      },
      {
        id: "fireball-red",
        name: "Fireball Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/fireball-red.webp",
        image: "/vehicles/meteor-350/fireball-red.webp",
      },
      {
        id: "fireball-yellow",
        name: "Fireball Yellow",
        swatch: "#D8A62A",
        render: "/vehicles/meteor-350/fireball-yellow.webp",
        image: "/vehicles/meteor-350/fireball-yellow.webp",
      },
      {
        id: "stellar-black",
        name: "Stellar Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/stellar-black.webp",
        image: "/vehicles/meteor-350/stellar-black.webp",
      },
      {
        id: "stellar-red",
        name: "Stellar Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/stellar-red.webp",
        image: "/vehicles/meteor-350/stellar-red.webp",
      },
      {
        id: "supernova-blue",
        name: "Supernova Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/supernova-blue.webp",
        image: "/vehicles/meteor-350/supernova-blue.webp",
      },
      {
        id: "supernova-red",
        name: "Supernova Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/supernova-red.webp",
        image: "/vehicles/meteor-350/supernova-red.webp",
      },
      {
        id: "supernova-brown",
        name: "Supernova Brown",
        swatch: "#5E4230",
        render: "/vehicles/meteor-350/supernova-brown.webp",
        image: "/vehicles/meteor-350/supernova-brown.webp",
      },
      {
        id: "aurora-black",
        name: "Aurora Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/aurora-black.webp",
        image: "/vehicles/meteor-350/aurora-black.webp",
      },
      {
        id: "aurora-green",
        name: "Aurora Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/aurora-green.webp",
        image: "/vehicles/meteor-350/aurora-green.webp",
      },
    ],
  },
  {
    id: "shotgun-650",
    name: "Shotgun 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/shotgun-650/cover.webp",
        image: "/vehicles/shotgun-650/cover.webp",
    colors: [
      {
        id: "stencil-white",
        name: "Stencil White",
        swatch: "#EDEFF2",
        render: "/vehicles/shotgun-650/stencil-white.webp",
        image: "/vehicles/shotgun-650/stencil-white.webp",
      },
      {
        id: "drill-green",
        name: "Drill Green",
        swatch: "#25543B",
        render: "/vehicles/shotgun-650/drill-green.webp",
        image: "/vehicles/shotgun-650/drill-green.webp",
      },
      {
        id: "plasma-blue",
        name: "Plasma Blue",
        swatch: "#22406E",
        render: "/vehicles/shotgun-650/plasma-blue.webp",
        image: "/vehicles/shotgun-650/plasma-blue.webp",
      },
      {
        id: "sheet-metal-grey",
        name: "Sheet Metal Grey",
        swatch: "#6E7378",
        render: "/vehicles/shotgun-650/sheet-metal-grey.webp",
        image: "/vehicles/shotgun-650/sheet-metal-grey.webp",
      },
    ],
  },
  {
    id: "goan-classic-350",
    name: "Goan Classic 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/goan-classic-350/cover.webp",
        image: "/vehicles/goan-classic-350/cover.webp",
    colors: [
      {
        id: "purple-haze",
        name: "Purple Haze",
        swatch: "#4A3468",
        render: "/vehicles/goan-classic-350/purple-haze.webp",
        image: "/vehicles/goan-classic-350/purple-haze.webp",
      },
      {
        id: "shack-black",
        name: "Shack Black",
        swatch: "#14161A",
        render: "/vehicles/goan-classic-350/shack-black.webp",
        image: "/vehicles/goan-classic-350/shack-black.webp",
      },
      {
        id: "trip-teal",
        name: "Trip Teal",
        swatch: "#1E6E6A",
        render: "/vehicles/goan-classic-350/trip-teal.webp",
        image: "/vehicles/goan-classic-350/trip-teal.webp",
      },
      {
        id: "rave-red",
        name: "Rave Red",
        swatch: "#A32330",
        render: "/vehicles/goan-classic-350/rave-red.webp",
        image: "/vehicles/goan-classic-350/rave-red.webp",
      },
    ],
  },
  {
    id: "bullet-350",
    name: "Bullet 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/bullet-350/cover.webp",
    image: "/vehicles/bullet-350/cover.webp",
    colors: [
      {
        id: "battalion-black",
        name: "Battalion Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/battalion-black.webp",
        image: "/vehicles/bullet-350/battalion-black.webp",
      },
      {
        id: "standard-black",
        name: "Standard Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/standard-black.webp",
        image: "/vehicles/bullet-350/standard-black.webp",
      },
      {
        id: "standard-maroon",
        name: "Standard Maroon",
        swatch: "#5E1F26",
        render: "/vehicles/bullet-350/standard-maroon.webp",
        image: "/vehicles/bullet-350/standard-maroon.webp",
      },
      {
        id: "black-gold",
        name: "Black Gold",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/black-gold.webp",
        image: "/vehicles/bullet-350/black-gold.webp",
      },
      {
        id: "military-black",
        name: "Military Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/military-black.webp",
        image: "/vehicles/bullet-350/military-black.webp",
      },
      {
        id: "military-silver-black",
        name: "Military Silver Black",
        swatch: "#C3C7CC",
        render: "/vehicles/bullet-350/military-silver-black.webp",
        /*
         * Military Black's render, on the studio's word that the two are the
         * same paint — the manufacturer's own photography does not tell them
         * apart either.
         *
         * Shared rather than copied: one file, and `render` still names where
         * this colourway's own shot would go if it ever turns out to differ.
         * This is the split working as intended — `render` is the promise,
         * `image` is what loads today.
         */
        image: "/vehicles/bullet-350/military-black.webp",
      },
      {
        id: "military-silver-red",
        name: "Military Silver Red",
        swatch: "#C3C7CC",
        render: "/vehicles/bullet-350/military-silver-red.webp",
        image: "/vehicles/bullet-350/military-silver-red.webp",
      },
    ],
  },
  {
    id: "bullet-650",
    name: "Bullet 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/bullet-650/cover.webp",
        image: "/vehicles/bullet-650/cover.webp",
    colors: [
      {
        id: "cannon-black",
        name: "Cannon Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-650/cannon-black.webp",
        image: "/vehicles/bullet-650/cannon-black.webp",
      },
      {
        id: "battleship-blue",
        name: "Battleship Blue",
        swatch: "#22406E",
        render: "/vehicles/bullet-650/battleship-blue.webp",
        image: "/vehicles/bullet-650/battleship-blue.webp",
      },
    ],
  },
  /*
   * The first machine here that is not a Royal Enfield.
   *
   * Nothing in the configurator cared about the marque — it is printed on the
   * card and searched against, and that is all — so this needed no code. It is
   * worth noticing anyway: the list is no longer one manufacturer's range, and
   * the search matching marque as well as model is what stops "bajaj" finding
   * nothing.
   */
  {
    id: "pulsar-150",
    name: "Pulsar 150",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-150/cover.webp",
    image: "/vehicles/pulsar-150/cover.webp",
    colors: [
      {
        id: "metallic-black-red",
        name: "Metallic Black Red",
        /* Inferred from the name like every other swatch on this page: a black
           carrying red rather than a red. Sample it from the render when there
           is one. */
        swatch: "#2A1216",
        render: "/vehicles/pulsar-150/metallic-black-red.webp",
        image: "/vehicles/pulsar-150/metallic-black-red.webp",
      },
      /* Bajaj's seven listed colourways for this machine. The one above is not
         among them by name, and it is kept: it is the only Pulsar 150 the
         studio has a render of, and dropping a shot that exists to match a
         list would be the wrong way round. Reconcile it with Sparkle Black Red
         if that is what it is. */
      {
        id: "sparkle-black-red",
        name: "Sparkle Black Red",
        swatch: "#2A1216",
        render: "/vehicles/pulsar-150/sparkle-black-red.webp",
        image: "/vehicles/pulsar-150/sparkle-black-red.webp",
      },
      {
        id: "sapphire-black-blue",
        name: "Sapphire Black Blue",
        swatch: "#1A2436",
        render: "/vehicles/pulsar-150/sapphire-black-blue.webp",
        image: "/vehicles/pulsar-150/sapphire-black-blue.webp",
      },
      /* The studio's folder holds two silvers and only one of them is one.
         `sparkle black silver.png` is a render of a red-graphic bike, and
         `sapphire black silver.png` is the silver one — but Sparkle Black
         Silver is the colourway that exists, confirmed by the studio, so the
         silver render is filed here and the misnamed file is unused. */
      {
        id: "sparkle-black-silver",
        name: "Sparkle Black Silver",
        swatch: "#3A3E44",
        render: "/vehicles/pulsar-150/sparkle-black-silver.webp",
        image: "/vehicles/pulsar-150/sparkle-black-silver.webp",
      },
      {
        id: "ebony-black-cherry-red",
        name: "Ebony Black Cherry Red",
        swatch: "#2A1216",
        render: "/vehicles/pulsar-150/ebony-black-cherry-red.webp",
        image: "/vehicles/pulsar-150/ebony-black-cherry-red.webp",
      },
      {
        id: "ebony-black-ink-blue",
        name: "Ebony Black Ink Blue",
        swatch: "#1A2436",
        render: "/vehicles/pulsar-150/ebony-black-ink-blue.webp",
        image: "/vehicles/pulsar-150/ebony-black-ink-blue.webp",
      },
      {
        id: "ebony-dark-grey",
        name: "Ebony Dark Grey",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-150/ebony-dark-grey.webp",
        image: "/vehicles/pulsar-150/ebony-dark-grey.webp",
      },
    ],
  },
  /*
   * The rest of the Bajaj range, as the studio supplied it: nineteen machines
   * and seventy-eight colourways, none of them rendered yet.
   *
   * They are here rather than held back because the picker's job at this point
   * in the form is to find out what a client rides, and a machine that is not
   * on the list cannot be picked. What the page must not do is imply a shot
   * exists — see PendingRender, and `pending` on both types below.
   */
  {
    id: "pulsar-125",
    name: "Pulsar 125",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-125/cover.webp",
    image: "/vehicles/pulsar-125/cover.webp",
    colors: [
      {
        id: "solar-red",
        name: "Solar Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-125/solar-red.webp",
        image: "/vehicles/pulsar-125/solar-red.webp",
      },
      {
        id: "neon-silver",
        name: "Neon Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/pulsar-125/neon-silver.webp",
        image: "/vehicles/pulsar-125/neon-silver.webp",
      },
      {
        id: "neon-green",
        name: "Neon Green",
        swatch: "#25543B",
        render: "/vehicles/pulsar-125/neon-green.webp",
        image: "/vehicles/pulsar-125/neon-green.webp",
      },
      {
        id: "black-dark-grey",
        name: "Black Dark Grey",
        swatch: "#3A3E44",
        render: "/vehicles/pulsar-125/black-dark-grey.webp",
        image: "/vehicles/pulsar-125/black-dark-grey.webp",
      },
    ],
  },
  {
    id: "pulsar-220f",
    name: "Pulsar 220 F",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-220f/cover.webp",
    image: "/vehicles/pulsar-220f/cover.webp",
    colors: [
      {
        id: "sparkle-black",
        name: "Sparkle Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-220f/sparkle-black.webp",
        image: "/vehicles/pulsar-220f/sparkle-black.webp",
      },
      {
        id: "volcanic-red",
        name: "Volcanic Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-220f/volcanic-red.webp",
        image: "/vehicles/pulsar-220f/volcanic-red.webp",
      },
      {
        id: "pearl-white",
        name: "Pearl White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-220f/pearl-white.webp",
        image: "/vehicles/pulsar-220f/pearl-white.webp",
      },
      {
        id: "sapphire-blue",
        name: "Sapphire Blue",
        swatch: "#22406E",
        render: "/vehicles/pulsar-220f/sapphire-blue.webp",
        image: "/vehicles/pulsar-220f/sapphire-blue.webp",
      },
      /* Removed with the rest of the range's Black Gold and reinstated here
         alone, on request. The other three — Pulsar 125, Pulsar 150 and the
         Platina 100's Black & Gold — stay out. */
      {
        id: "black-gold",
        name: "Black Gold",
        swatch: "#14161A",
        render: "/vehicles/pulsar-220f/black-gold.webp",
        image: "/vehicles/pulsar-220f/black-gold.webp",
      },
      {
        id: "black-cherry-red",
        name: "Black Cherry Red",
        swatch: "#2A1216",
        render: "/vehicles/pulsar-220f/black-cherry-red.webp",
        image: "/vehicles/pulsar-220f/black-cherry-red.webp",
      },
      {
        id: "black-ink-blue",
        name: "Black Ink Blue",
        swatch: "#1A2436",
        render: "/vehicles/pulsar-220f/black-ink-blue.webp",
        image: "/vehicles/pulsar-220f/black-ink-blue.webp",
      },
      {
        id: "black-copper-beige",
        name: "Black Copper Beige",
        swatch: "#8A7358",
        render: "/vehicles/pulsar-220f/black-copper-beige.webp",
        image: "/vehicles/pulsar-220f/black-copper-beige.webp",
      },
    ],
  },
  {
    id: "pulsar-rs200",
    name: "Pulsar RS200",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-rs200/cover.webp",
    image: "/vehicles/pulsar-rs200/cover.webp",
    colors: [
      {
        id: "glossy-racing-red",
        name: "Glossy Racing Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-rs200/glossy-racing-red.webp",
        image: "/vehicles/pulsar-rs200/glossy-racing-red.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-rs200/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-rs200/pearl-metallic-white.webp",
      },
      {
        id: "active-black-satin",
        name: "Active Black Satin",
        swatch: "#14161A",
        render: "/vehicles/pulsar-rs200/active-black-satin.webp",
        image: "/vehicles/pulsar-rs200/active-black-satin.webp",
      },
      {
        id: "brooklyn-black",
        name: "Brooklyn Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-rs200/brooklyn-black.webp",
        image: "/vehicles/pulsar-rs200/brooklyn-black.webp",
      },
      {
        id: "pearl-metallic-white-and-caribbean-blue",
        name: "Pearl Metallic White & Caribbean Blue",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-rs200/pearl-metallic-white-and-caribbean-blue.webp",
        image: "/vehicles/pulsar-rs200/pearl-metallic-white-and-caribbean-blue.webp",
      },
    ],
  },
  {
    id: "pulsar-n125",
    name: "Pulsar N125",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-n125/cover.webp",
    image: "/vehicles/pulsar-n125/cover.webp",
    colors: [
      {
        id: "ebony-black-cocktail-wine-red",
        name: "Ebony Black - Cocktail Wine Red",
        swatch: "#2A1216",
        render: "/vehicles/pulsar-n125/ebony-black-cocktail-wine-red.webp",
        image: "/vehicles/pulsar-n125/ebony-black-cocktail-wine-red.webp",
      },
      {
        id: "ebony-black-purple-fury",
        name: "Ebony Black - Purple Fury",
        swatch: "#4A3468",
        render: "/vehicles/pulsar-n125/ebony-black-purple-fury.webp",
        image: "/vehicles/pulsar-n125/ebony-black-purple-fury.webp",
      },
      {
        id: "pewter-grey",
        name: "Pewter Grey",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-n125/pewter-grey.webp",
        image: "/vehicles/pulsar-n125/pewter-grey.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-n125/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-n125/pearl-metallic-white.webp",
      },
      /* Three the brief did not list, all three rendered in the studio's own
         PULSAR N125 folder. A render that exists is better evidence of what
         Bajaj sells than a list typed out by hand, so they are added. */
      {
        id: "caribbean-blue",
        name: "Caribbean Blue",
        swatch: "#22406E",
        render: "/vehicles/pulsar-n125/caribbean-blue.webp",
        image: "/vehicles/pulsar-n125/caribbean-blue.webp",
      },
      {
        id: "cocktail-wine-red",
        name: "Cocktail Wine Red",
        swatch: "#5E1F26",
        render: "/vehicles/pulsar-n125/cocktail-wine-red.webp",
        image: "/vehicles/pulsar-n125/cocktail-wine-red.webp",
      },
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-n125/ebony-black.webp",
        image: "/vehicles/pulsar-n125/ebony-black.webp",
      },
    ],
  },
  {
    id: "pulsar-n150",
    name: "Pulsar N150",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-n150/cover.webp",
    image: "/vehicles/pulsar-n150/cover.webp",
    colors: [
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-n150/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-n150/pearl-metallic-white.webp",
      },
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-n150/ebony-black.webp",
        image: "/vehicles/pulsar-n150/ebony-black.webp",
      },
    ],
  },
  {
    id: "pulsar-n160",
    name: "Pulsar N160",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-n160/cover.webp",
    image: "/vehicles/pulsar-n160/cover.webp",
    colors: [
      {
        id: "glossy-racing-red",
        name: "Glossy Racing Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-n160/glossy-racing-red.webp",
        image: "/vehicles/pulsar-n160/glossy-racing-red.webp",
      },
      {
        id: "polar-sky-blue",
        name: "Polar Sky Blue",
        swatch: "#22406E",
        render: "/vehicles/pulsar-n160/polar-sky-blue.webp",
        image: "/vehicles/pulsar-n160/polar-sky-blue.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-n160/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-n160/pearl-metallic-white.webp",
      },
      {
        id: "brooklyn-black",
        name: "Brooklyn Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-n160/brooklyn-black.webp",
        image: "/vehicles/pulsar-n160/brooklyn-black.webp",
      },
    ],
  },
  {
    id: "pulsar-n250",
    name: "Pulsar N250",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-n250/cover.webp",
    image: "/vehicles/pulsar-n250/cover.webp",
    colors: [
      {
        id: "glossy-racing-red",
        name: "Glossy Racing Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-n250/glossy-racing-red.webp",
        image: "/vehicles/pulsar-n250/glossy-racing-red.webp",
      },
      {
        id: "brooklyn-black",
        name: "Brooklyn Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-n250/brooklyn-black.webp",
        image: "/vehicles/pulsar-n250/brooklyn-black.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-n250/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-n250/pearl-metallic-white.webp",
      },
    ],
  },
  {
    id: "pulsar-ns125",
    name: "Pulsar NS125",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-ns125/cover.webp",
    image: "/vehicles/pulsar-ns125/cover.webp",
    colors: [
      {
        id: "fiery-orange",
        name: "Fiery Orange",
        swatch: "#C4622A",
        render: "/vehicles/pulsar-ns125/fiery-orange.webp",
        image: "/vehicles/pulsar-ns125/fiery-orange.webp",
      },
      {
        id: "burnt-red",
        name: "Burnt Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-ns125/burnt-red.webp",
        image: "/vehicles/pulsar-ns125/burnt-red.webp",
      },
      {
        id: "beach-blue",
        name: "Beach Blue",
        swatch: "#22406E",
        render: "/vehicles/pulsar-ns125/beach-blue.webp",
        image: "/vehicles/pulsar-ns125/beach-blue.webp",
      },
      {
        id: "pewter-grey",
        name: "Pewter Grey",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-ns125/pewter-grey.webp",
        image: "/vehicles/pulsar-ns125/pewter-grey.webp",
      },
    ],
  },
  {
    id: "pulsar-ns160",
    name: "Pulsar NS160",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-ns160/cover.webp",
    image: "/vehicles/pulsar-ns160/cover.webp",
    colors: [
      {
        id: "cocktail-wine-red",
        name: "Cocktail Wine Red",
        swatch: "#5E1F26",
        render: "/vehicles/pulsar-ns160/cocktail-wine-red.webp",
        image: "/vehicles/pulsar-ns160/cocktail-wine-red.webp",
      },
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-ns160/ebony-black.webp",
        image: "/vehicles/pulsar-ns160/ebony-black.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-ns160/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-ns160/pearl-metallic-white.webp",
      },
      {
        id: "pewter-grey",
        name: "Pewter Grey",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-ns160/pewter-grey.webp",
        image: "/vehicles/pulsar-ns160/pewter-grey.webp",
      },
    ],
  },
  {
    id: "pulsar-ns200",
    name: "Pulsar NS200",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-ns200/cover.webp",
    image: "/vehicles/pulsar-ns200/cover.webp",
    colors: [
      {
        id: "cocktail-wine-red-white",
        name: "Cocktail Wine Red - White",
        swatch: "#5E1F26",
        render: "/vehicles/pulsar-ns200/cocktail-wine-red-white.webp",
        image: "/vehicles/pulsar-ns200/cocktail-wine-red-white.webp",
      },
      {
        id: "glossy-ebony-black",
        name: "Glossy Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-ns200/glossy-ebony-black.webp",
        image: "/vehicles/pulsar-ns200/glossy-ebony-black.webp",
      },
      {
        id: "metallic-pearl-white",
        name: "Metallic Pearl White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-ns200/metallic-pearl-white.webp",
        image: "/vehicles/pulsar-ns200/metallic-pearl-white.webp",
      },
      {
        id: "pewter-grey-blue",
        name: "Pewter Grey - Blue",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-ns200/pewter-grey-blue.webp",
        image: "/vehicles/pulsar-ns200/pewter-grey-blue.webp",
      },
    ],
  },
  {
    id: "pulsar-ns400z",
    name: "Pulsar NS400 Z",
    manufacturer: "Bajaj",
    render: "/vehicles/pulsar-ns400z/cover.webp",
    image: "/vehicles/pulsar-ns400z/cover.webp",
    colors: [
      {
        id: "brooklyn-black",
        name: "Brooklyn Black",
        swatch: "#14161A",
        render: "/vehicles/pulsar-ns400z/brooklyn-black.webp",
        image: "/vehicles/pulsar-ns400z/brooklyn-black.webp",
      },
      {
        id: "glossy-racing-red",
        name: "Glossy Racing Red",
        swatch: "#A32330",
        render: "/vehicles/pulsar-ns400z/glossy-racing-red.webp",
        image: "/vehicles/pulsar-ns400z/glossy-racing-red.webp",
      },
      {
        id: "pearl-metallic-white",
        name: "Pearl Metallic White",
        swatch: "#EDEFF2",
        render: "/vehicles/pulsar-ns400z/pearl-metallic-white.webp",
        image: "/vehicles/pulsar-ns400z/pearl-metallic-white.webp",
      },
      {
        id: "pewter-grey",
        name: "Pewter Grey",
        swatch: "#6E7378",
        render: "/vehicles/pulsar-ns400z/pewter-grey.webp",
        image: "/vehicles/pulsar-ns400z/pewter-grey.webp",
      },
    ],
  },
  {
    id: "dominar-250",
    name: "Dominar 250",
    manufacturer: "Bajaj",
    render: "/vehicles/dominar-250/cover.webp",
    image: "/vehicles/dominar-250/cover.webp",
    colors: [
      {
        id: "canyon-red",
        name: "Canyon Red",
        swatch: "#A32330",
        render: "/vehicles/dominar-250/canyon-red.webp",
        image: "/vehicles/dominar-250/canyon-red.webp",
      },
      {
        id: "sparkling-black",
        name: "Sparkling Black",
        swatch: "#14161A",
        render: "/vehicles/dominar-250/sparkling-black.webp",
        image: "/vehicles/dominar-250/sparkling-black.webp",
      },
      {
        id: "citrus-rush",
        name: "Citrus Rush",
        swatch: "#C4622A",
        render: "/vehicles/dominar-250/citrus-rush.webp",
        image: "/vehicles/dominar-250/citrus-rush.webp",
      },
    ],
  },
  {
    id: "dominar-400",
    name: "Dominar 400",
    manufacturer: "Bajaj",
    render: "/vehicles/dominar-400/cover.webp",
    image: "/vehicles/dominar-400/cover.webp",
    colors: [
      {
        id: "aurora-green",
        name: "Aurora Green",
        swatch: "#25543B",
        render: "/vehicles/dominar-400/aurora-green.webp",
        image: "/vehicles/dominar-400/aurora-green.webp",
      },
      {
        id: "charcoal-black",
        name: "Charcoal Black",
        swatch: "#14161A",
        render: "/vehicles/dominar-400/charcoal-black.webp",
        image: "/vehicles/dominar-400/charcoal-black.webp",
      },
    ],
  },
  {
    id: "platina-100",
    name: "Platina 100",
    manufacturer: "Bajaj",
    render: "/vehicles/platina-100/cover.webp",
    image: "/vehicles/platina-100/cover.webp",
    colors: [
      {
        id: "black-and-red",
        name: "Black & Red",
        swatch: "#2A1216",
        render: "/vehicles/platina-100/black-and-red.webp",
        image: "/vehicles/platina-100/black-and-red.webp",
      },
      {
        id: "black-and-silver",
        name: "Black & Silver",
        swatch: "#3A3E44",
        render: "/vehicles/platina-100/black-and-silver.webp",
        image: "/vehicles/platina-100/black-and-silver.webp",
      },
      {
        id: "black-and-blue",
        name: "Black & Blue",
        swatch: "#1A2436",
        render: "/vehicles/platina-100/black-and-blue.webp",
        image: "/vehicles/platina-100/black-and-blue.webp",
      },
      {
        id: "black-and-white",
        name: "Black & White",
        swatch: "#2E3238",
        render: "/vehicles/platina-100/black-and-white.webp",
        image: "/vehicles/platina-100/black-and-white.webp",
      },
      {
        id: "blue",
        name: "Blue",
        swatch: "#22406E",
        render: "/vehicles/platina-100/blue.webp",
        image: "/vehicles/platina-100/blue.webp",
      },
      {
        id: "red",
        name: "Red",
        swatch: "#A32330",
        render: "/vehicles/platina-100/red.webp",
        image: "/vehicles/platina-100/red.webp",
      },
    ],
  },
  {
    id: "platina-110",
    name: "Platina 110",
    manufacturer: "Bajaj",
    render: "/vehicles/platina-110/cover.webp",
    image: "/vehicles/platina-110/cover.webp",
    colors: [
      {
        id: "satin-beach-blue",
        name: "Satin Beach Blue",
        swatch: "#22406E",
        render: "/vehicles/platina-110/satin-beach-blue.webp",
        image: "/vehicles/platina-110/satin-beach-blue.webp",
      },
      {
        id: "charcoal-black",
        name: "Charcoal Black",
        swatch: "#14161A",
        render: "/vehicles/platina-110/charcoal-black.webp",
        image: "/vehicles/platina-110/charcoal-black.webp",
      },
      {
        id: "volcanic-matte-red",
        name: "Volcanic Matte Red",
        swatch: "#A32330",
        render: "/vehicles/platina-110/volcanic-matte-red.webp",
        image: "/vehicles/platina-110/volcanic-matte-red.webp",
      },
      {
        id: "black-and-white",
        name: "Black & White",
        swatch: "#2E3238",
        render: "/vehicles/platina-110/black-and-white.webp",
        image: "/vehicles/platina-110/black-and-white.webp",
      },
      {
        id: "black-and-red",
        name: "Black & Red",
        swatch: "#2A1216",
        render: "/vehicles/platina-110/black-and-red.webp",
        image: "/vehicles/platina-110/black-and-red.webp",
      },
      {
        id: "blue",
        name: "Blue",
        swatch: "#22406E",
        render: "/vehicles/platina-110/blue.webp",
        image: "/vehicles/platina-110/blue.webp",
      },
      {
        id: "red",
        name: "Red",
        swatch: "#A32330",
        render: "/vehicles/platina-110/red.webp",
        image: "/vehicles/platina-110/red.webp",
      },
    ],
  },
  {
    id: "ct-110x",
    name: "CT 110X",
    manufacturer: "Bajaj",
    render: "/vehicles/ct-110x/cover.webp",
    image: "/vehicles/ct-110x/cover.webp",
    colors: [
      {
        id: "matte-wild-green",
        name: "Matte Wild Green",
        swatch: "#25543B",
        render: "/vehicles/ct-110x/matte-wild-green.webp",
        image: "/vehicles/ct-110x/matte-wild-green.webp",
      },
      {
        id: "ebony-black-red",
        name: "Ebony Black - Red",
        swatch: "#2A1216",
        render: "/vehicles/ct-110x/ebony-black-red.webp",
        image: "/vehicles/ct-110x/ebony-black-red.webp",
      },
      {
        id: "ebony-black-blue",
        name: "Ebony Black - Blue",
        swatch: "#1A2436",
        render: "/vehicles/ct-110x/ebony-black-blue.webp",
        image: "/vehicles/ct-110x/ebony-black-blue.webp",
      },
    ],
  },
  {
    id: "avenger-street-160",
    name: "Avenger Street 160",
    manufacturer: "Bajaj",
    render: "/vehicles/avenger-street-160/cover.webp",
    image: "/vehicles/avenger-street-160/cover.webp",
    colors: [
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/avenger-street-160/ebony-black.webp",
        image: "/vehicles/avenger-street-160/ebony-black.webp",
      },
      {
        id: "spicy-red",
        name: "Spicy Red",
        swatch: "#A32330",
        render: "/vehicles/avenger-street-160/spicy-red.webp",
        image: "/vehicles/avenger-street-160/spicy-red.webp",
      },
    ],
  },
  {
    id: "avenger-street-220",
    name: "Avenger Street 220",
    manufacturer: "Bajaj",
    render: "/vehicles/avenger-street-220/cover.webp",
    image: "/vehicles/avenger-street-220/cover.webp",
    colors: [
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/avenger-street-220/ebony-black.webp",
        image: "/vehicles/avenger-street-220/ebony-black.webp",
      },
      {
        id: "cocktail-wine-red",
        name: "Cocktail Wine Red",
        swatch: "#5E1F26",
        render: "/vehicles/avenger-street-220/cocktail-wine-red.webp",
        image: "/vehicles/avenger-street-220/cocktail-wine-red.webp",
      },
    ],
  },
  {
    id: "avenger-cruise-220",
    name: "Avenger Cruise 220",
    manufacturer: "Bajaj",
    render: "/vehicles/avenger-cruise-220/cover.webp",
    image: "/vehicles/avenger-cruise-220/cover.webp",
    colors: [
      {
        id: "auburn-black",
        name: "Auburn Black",
        swatch: "#14161A",
        render: "/vehicles/avenger-cruise-220/auburn-black.webp",
        image: "/vehicles/avenger-cruise-220/auburn-black.webp",
      },
      {
        id: "moon-white",
        name: "Moon White",
        swatch: "#EDEFF2",
        render: "/vehicles/avenger-cruise-220/moon-white.webp",
        image: "/vehicles/avenger-cruise-220/moon-white.webp",
      },
      {
        /* Sampled off the render rather than inferred from the name, which is
           how most of the swatches above were picked. "Desert Gold" could be
           anything from a pale sand to a brass; the tank is a warm metallic
           gold and this is it. */
        id: "desert-gold",
        name: "Desert Gold",
        swatch: "#C08D35",
        render: "/vehicles/avenger-cruise-220/desert-gold.webp",
        image: "/vehicles/avenger-cruise-220/desert-gold.webp",
      },
    ],
  },
  /*
   * Hero, which is a new marque — the chip row goes to eight on its own.
   *
   * Six machines and twenty colourways. They arrived on the same terms as the
   * Bajaj range above -- listed before they were shot, so the picker could
   * answer what a client rides -- and every one of them has a render now. The
   * XPulse 210 Top was off the page for a while, when its two colourways were
   * the last anywhere without one.
   *
   * XPulse 210 Base and Top are two entries because they were supplied as two,
   * with different paint on each. That is the same call the X440's S and T got,
   * and the same caveat applies — they are the studio's labels for the trims,
   * not necessarily Hero's.
   */
  {
    id: "hero-xpulse-210-base",
    name: "XPulse 210 Base",
    manufacturer: "Hero",
    render: "/vehicles/hero-xpulse-210-base/cover.webp",
    image: "/vehicles/hero-xpulse-210-base/cover.webp",
    colors: [
      {
        id: "glacier-white",
        name: "Glacier White",
        swatch: "#EDEFF2",
        render: "/vehicles/hero-xpulse-210-base/glacier-white.webp",
        image: "/vehicles/hero-xpulse-210-base/glacier-white.webp",
      },
    ],
  },
  {
    id: "hero-xpulse-210-top",
    name: "XPulse 210 Top",
    manufacturer: "Hero",
    render: "/vehicles/hero-xpulse-210-top/cover.webp",
    image: "/vehicles/hero-xpulse-210-top/cover.webp",
    colors: [
      {
        id: "azure-blue",
        name: "Azure Blue",
        swatch: "#22406E",
        render: "/vehicles/hero-xpulse-210-top/azure-blue.webp",
        image: "/vehicles/hero-xpulse-210-top/azure-blue.webp",
      },
      {
        id: "alpine-silver",
        name: "Alpine Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/hero-xpulse-210-top/alpine-silver.webp",
        image: "/vehicles/hero-xpulse-210-top/alpine-silver.webp",
      },
    ],
  },
  {
    id: "hero-karizma-xmr",
    name: "Karizma XMR",
    manufacturer: "Hero",
    render: "/vehicles/hero-karizma-xmr/cover.webp",
    image: "/vehicles/hero-karizma-xmr/cover.webp",
    colors: [
      {
        id: "iconic-yellow",
        name: "Iconic Yellow",
        swatch: "#D8A62A",
        render: "/vehicles/hero-karizma-xmr/iconic-yellow.webp",
        image: "/vehicles/hero-karizma-xmr/iconic-yellow.webp",
      },
      {
        id: "turbo-red",
        name: "Turbo Red",
        swatch: "#A32330",
        render: "/vehicles/hero-karizma-xmr/turbo-red.webp",
        image: "/vehicles/hero-karizma-xmr/turbo-red.webp",
      },
      {
        id: "phantom-black",
        name: "Phantom Black",
        swatch: "#14161A",
        render: "/vehicles/hero-karizma-xmr/phantom-black.webp",
        image: "/vehicles/hero-karizma-xmr/phantom-black.webp",
      },
    ],
  },
  {
    id: "hero-glamour-x",
    name: "Glamour X",
    manufacturer: "Hero",
    render: "/vehicles/hero-glamour-x/cover.webp",
    image: "/vehicles/hero-glamour-x/cover.webp",
    colors: [
      {
        id: "black-pearl-red",
        name: "Black Pearl Red",
        swatch: "#2A1216",
        render: "/vehicles/hero-glamour-x/black-pearl-red.webp",
        image: "/vehicles/hero-glamour-x/black-pearl-red.webp",
      },
      {
        id: "black-teal-blue",
        name: "Black Teal Blue",
        swatch: "#235C73",
        render: "/vehicles/hero-glamour-x/black-teal-blue.webp",
        image: "/vehicles/hero-glamour-x/black-teal-blue.webp",
      },
      {
        id: "candy-blazing-red",
        name: "Candy Blazing Red",
        swatch: "#A32330",
        render: "/vehicles/hero-glamour-x/candy-blazing-red.webp",
        image: "/vehicles/hero-glamour-x/candy-blazing-red.webp",
      },
      {
        id: "matt-metallic-silver",
        name: "Matt Metallic Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/hero-glamour-x/matt-metallic-silver.webp",
        image: "/vehicles/hero-glamour-x/matt-metallic-silver.webp",
      },
      {
        id: "metallic-nexus-blue",
        name: "Metallic Nexus Blue",
        swatch: "#22406E",
        render: "/vehicles/hero-glamour-x/metallic-nexus-blue.webp",
        image: "/vehicles/hero-glamour-x/metallic-nexus-blue.webp",
      },
    ],
  },
  {
    id: "hero-xtreme-125r",
    name: "Xtreme 125R",
    manufacturer: "Hero",
    render: "/vehicles/hero-xtreme-125r/cover.webp",
    image: "/vehicles/hero-xtreme-125r/cover.webp",
    colors: [
      {
        id: "black-pearl-red",
        name: "Black Pearl Red",
        swatch: "#2A1216",
        render: "/vehicles/hero-xtreme-125r/black-pearl-red.webp",
        image: "/vehicles/hero-xtreme-125r/black-pearl-red.webp",
      },
      {
        id: "black-mattshadow-grey",
        name: "Black Mattshadow Grey",
        swatch: "#3A3E44",
        render: "/vehicles/hero-xtreme-125r/black-mattshadow-grey.webp",
        image: "/vehicles/hero-xtreme-125r/black-mattshadow-grey.webp",
      },
      {
        id: "black-leaf-green",
        name: "Black Leaf Green",
        swatch: "#4A8228",
        render: "/vehicles/hero-xtreme-125r/black-leaf-green.webp",
        image: "/vehicles/hero-xtreme-125r/black-leaf-green.webp",
      },
      {
        id: "firestorm-red",
        name: "Firestorm Red",
        swatch: "#A32330",
        render: "/vehicles/hero-xtreme-125r/firestorm-red.webp",
        image: "/vehicles/hero-xtreme-125r/firestorm-red.webp",
      },
      {
        id: "cobalt-blue",
        name: "Cobalt Blue",
        swatch: "#22406E",
        render: "/vehicles/hero-xtreme-125r/cobalt-blue.webp",
        image: "/vehicles/hero-xtreme-125r/cobalt-blue.webp",
      },
      {
        id: "stallion-black",
        name: "Stallion Black",
        swatch: "#14161A",
        render: "/vehicles/hero-xtreme-125r/stallion-black.webp",
        image: "/vehicles/hero-xtreme-125r/stallion-black.webp",
      },
    ],
  },
  {
    id: "hero-xtreme-250r",
    name: "Xtreme 250R",
    manufacturer: "Hero",
    render: "/vehicles/hero-xtreme-250r/cover.webp",
    image: "/vehicles/hero-xtreme-250r/cover.webp",
    colors: [
      {
        id: "firestorm-red",
        name: "Firestorm Red",
        swatch: "#A32330",
        render: "/vehicles/hero-xtreme-250r/firestorm-red.webp",
        image: "/vehicles/hero-xtreme-250r/firestorm-red.webp",
      },
      {
        id: "neon-shooting-star",
        name: "Neon Shooting Star",
        swatch: "#A8B60E",
        render: "/vehicles/hero-xtreme-250r/neon-shooting-star.webp",
        image: "/vehicles/hero-xtreme-250r/neon-shooting-star.webp",
      },
      {
        id: "stealth-black",
        name: "Stealth Black",
        swatch: "#14161A",
        render: "/vehicles/hero-xtreme-250r/stealth-black.webp",
        image: "/vehicles/hero-xtreme-250r/stealth-black.webp",
      },
    ],
  },
  {
    id: "honda-cb-350-rs",
    name: "CB 350 RS",
    manufacturer: "Honda",
    render: "/vehicles/honda-cb-350-rs/cover.webp",
    image: "/vehicles/honda-cb-350-rs/cover.webp",
    colors: [
      {
        id: "mat-axis-grey-metallic",
        name: "Mat Axis Grey Metallic",
        swatch: "#6E7378",
        render: "/vehicles/honda-cb-350-rs/mat-axis-grey-metallic.webp",
        image: "/vehicles/honda-cb-350-rs/mat-axis-grey-metallic.webp",
      },
      {
        id: "pearl-igneous-black",
        name: "Pearl Igneous Black",
        swatch: "#14161A",
        render: "/vehicles/honda-cb-350-rs/pearl-igneous-black.webp",
        image: "/vehicles/honda-cb-350-rs/pearl-igneous-black.webp",
      },
      {
        id: "pearl-deep-ground-gray",
        name: "Pearl Deep Ground Gray",
        swatch: "#4A4F55",
        render: "/vehicles/honda-cb-350-rs/pearl-deep-ground-gray.webp",
        image: "/vehicles/honda-cb-350-rs/pearl-deep-ground-gray.webp",
      },
      {
        id: "rebel-red-metallic",
        name: "Rebel Red Metallic",
        swatch: "#A32330",
        render: "/vehicles/honda-cb-350-rs/rebel-red-metallic.webp",
        image: "/vehicles/honda-cb-350-rs/rebel-red-metallic.webp",
      },
      {
        /* The studio's file is "black with pearl sports yellow", and that is
           what the render is: a black machine with a yellow tank flash, not a
           yellow one. Named for Honda's own colour like the four above it,
           swatched like Metallic Black Red on the Pulsar 150 -- a black
           carrying yellow. A #D8A62A here would be the tank stripe standing in
           for the whole motorcycle. */
        id: "pearl-sports-yellow",
        name: "Pearl Sports Yellow",
        swatch: "#2E2411",
        render: "/vehicles/honda-cb-350-rs/pearl-sports-yellow.webp",
        image: "/vehicles/honda-cb-350-rs/pearl-sports-yellow.webp",
      },
    ],
  },
  /*
   * Honda's H'ness, and the plain CB350 below it.
   *
   * The H'ness arrived in two files and then in six, and the four that came
   * later changed what the first two meant. Two of the six are Pearl Igneous
   * Black and two are a deep ground grey; what separates each pair is the trim,
   * Dlx Pro Chrome against Dlx Pro, and the renders are visibly different
   * motorcycles -- brown seat and chrome against black seat and none.
   *
   * So the trim rides in the colour name. It is not a colour and it does not
   * belong there, and the honest alternative is to split this into two or three
   * machines the way the X440's S and T are split. That was not done because
   * the studio's own labels are inconsistent about it -- one file says Dlx
   * where its neighbours say Dlx Pro -- and inventing the grouping is worse
   * than carrying six plain labels. Split it the moment the trims are
   * confirmed.
   */
  {
    id: "honda-cb-hness-350",
    name: "CB H'ness 350",
    manufacturer: "Honda",
    render: "/vehicles/honda-cb-hness-350/cover.webp",
    image: "/vehicles/honda-cb-hness-350/cover.webp",
    colors: [
      {
        id: "blue-metallic-dlx-pro-chrome",
        name: "Blue Metallic - Dlx Pro Chrome",
        swatch: "#22406E",
        render: "/vehicles/honda-cb-hness-350/blue-metallic-dlx-pro-chrome.webp",
        image: "/vehicles/honda-cb-hness-350/blue-metallic-dlx-pro-chrome.webp",
      },
      {
        id: "decent-pearl-deep-ground-grey-dlx-pro-chrome",
        name: "Decent Pearl Deep Ground Grey - Dlx Pro Chrome",
        swatch: "#4A4F55",
        render: "/vehicles/honda-cb-hness-350/decent-pearl-deep-ground-grey-dlx-pro-chrome.webp",
        image: "/vehicles/honda-cb-hness-350/decent-pearl-deep-ground-grey-dlx-pro-chrome.webp",
      },
      {
        id: "pearl-deep-ground-grey-dlx",
        name: "Pearl Deep Ground Grey - Dlx",
        swatch: "#4A4F55",
        render: "/vehicles/honda-cb-hness-350/pearl-deep-ground-grey-dlx.webp",
        image: "/vehicles/honda-cb-hness-350/pearl-deep-ground-grey-dlx.webp",
      },
      {
        id: "pearl-igneous-black-dlx-pro-chrome",
        name: "Pearl Igneous Black - Dlx Pro Chrome",
        swatch: "#14161A",
        render: "/vehicles/honda-cb-hness-350/pearl-igneous-black-dlx-pro-chrome.webp",
        image: "/vehicles/honda-cb-hness-350/pearl-igneous-black-dlx-pro-chrome.webp",
      },
      {
        id: "pearl-igneous-black-dlx-pro",
        name: "Pearl Igneous Black - Dlx Pro",
        swatch: "#14161A",
        render: "/vehicles/honda-cb-hness-350/pearl-igneous-black-dlx-pro.webp",
        image: "/vehicles/honda-cb-hness-350/pearl-igneous-black-dlx-pro.webp",
      },
      {
        id: "precious-red-metallic-dlx-pro",
        name: "Precious Red Metallic - Dlx Pro",
        swatch: "#A32330",
        render: "/vehicles/honda-cb-hness-350/precious-red-metallic-dlx-pro.webp",
        image: "/vehicles/honda-cb-hness-350/precious-red-metallic-dlx-pro.webp",
      },
    ],
  },
  /*
   * The plain CB350, which is neither the RS above nor the H'ness.
   *
   * Mat Dune Brown was filed with the H'ness last commit, on the strength of
   * the bodywork in a render that arrived loose in the Bajaj folder. It was
   * wrong: the studio's own CB350 folder holds it alongside the other four,
   * and those four are this machine and not the RS's -- same names, different
   * motorcycle, chrome pipe and teardrop tank against the RS's flat bench.
   */
  {
    id: "honda-cb350",
    name: "CB350",
    manufacturer: "Honda",
    render: "/vehicles/honda-cb350/cover.webp",
    image: "/vehicles/honda-cb350/cover.webp",
    colors: [
      {
        id: "mat-axis-gray-metallic",
        name: "Mat Axis Gray Metallic",
        swatch: "#6E7378",
        render: "/vehicles/honda-cb350/mat-axis-gray-metallic.webp",
        image: "/vehicles/honda-cb350/mat-axis-gray-metallic.webp",
      },
      {
        id: "mat-dune-brown",
        name: "Mat Dune Brown",
        swatch: "#B7A283",
        render: "/vehicles/honda-cb350/mat-dune-brown.webp",
        image: "/vehicles/honda-cb350/mat-dune-brown.webp",
      },
      {
        id: "pearl-deep-ground-gray",
        name: "Pearl Deep Ground Gray",
        swatch: "#4A4F55",
        render: "/vehicles/honda-cb350/pearl-deep-ground-gray.webp",
        image: "/vehicles/honda-cb350/pearl-deep-ground-gray.webp",
      },
      {
        id: "pearl-igneous-black",
        name: "Pearl Igneous Black",
        swatch: "#14161A",
        render: "/vehicles/honda-cb350/pearl-igneous-black.webp",
        image: "/vehicles/honda-cb350/pearl-igneous-black.webp",
      },
      {
        id: "rebel-red-metallic",
        name: "Rebel Red Metallic",
        swatch: "#A32330",
        render: "/vehicles/honda-cb350/rebel-red-metallic.webp",
        image: "/vehicles/honda-cb350/rebel-red-metallic.webp",
      },
    ],
  },
  /*
   * The CB500X and the Africa Twin, one colourway each.
   *
   * Both are the studio's newest frames and both arrived alone, which is what
   * a machine looks like on the day it is added -- the XPulse 210 Base has
   * stood on one colourway since it was put back. A second frame is a file and
   * five lines.
   */
  {
    id: "honda-cb500x",
    name: "CB500X",
    manufacturer: "Honda",
    render: "/vehicles/honda-cb500x/cover.webp",
    image: "/vehicles/honda-cb500x/cover.webp",
    colors: [
      {
        /* "Blue" is the studio's filename and it is what is here, but it is
           almost certainly short for Honda's own name for this paint the way
           Grand Prix Red below is Honda's -- worth asking before a client
           reads a one-word colour beside fifteen named ones. */
        id: "blue",
        name: "Blue",
        swatch: "#22305E",
        render: "/vehicles/honda-cb500x/blue.webp",
        image: "/vehicles/honda-cb500x/blue.webp",
      },
    ],
  },
  {
    id: "honda-africa-twin",
    name: "Africa Twin",
    manufacturer: "Honda",
    render: "/vehicles/honda-africa-twin/cover.webp",
    image: "/vehicles/honda-africa-twin/cover.webp",
    colors: [
      {
        id: "grand-prix-red",
        name: "Grand Prix Red",
        swatch: "#C8202B",
        render: "/vehicles/honda-africa-twin/grand-prix-red.webp",
        image: "/vehicles/honda-africa-twin/grand-prix-red.webp",
      },
    ],
  },
  {
    id: "aprilia-rs-457",
    name: "RS 457",
    manufacturer: "Aprilia",
    render: "/vehicles/aprilia-rs-457/cover.webp",
    image: "/vehicles/aprilia-rs-457/cover.webp",
    colors: [
      {
        id: "opalescent-white",
        name: "Opalescent White",
        swatch: "#EDEFF2",
        render: "/vehicles/aprilia-rs-457/opalescent-white.webp",
        image: "/vehicles/aprilia-rs-457/opalescent-white.webp",
      },
      {
        id: "prismatic-dark",
        name: "Prismatic Dark",
        swatch: "#1B1D22",
        render: "/vehicles/aprilia-rs-457/prismatic-dark.webp",
        image: "/vehicles/aprilia-rs-457/prismatic-dark.webp",
      },
      /* No hue in the name, so a neutral — the same rule Two Four Nine and
         Mark 2 get. Sample it from the render rather than guessing at what a
         livery is mostly made of.

         The comment sits above the entry rather than inside it: every colour in
         this file reads `id` then `name` on consecutive lines, and enough small
         scripts have now been pointed at that shape to make breaking it a real
         cost for a stylistic gain. */
      {
        id: "racing-stripes",
        name: "Racing Stripes",
        swatch: "#5A5F66",
        render: "/vehicles/aprilia-rs-457/racing-stripes.webp",
        image: "/vehicles/aprilia-rs-457/racing-stripes.webp",
      },
    ],
  },
  /*
   * "X440 S" and "X440 T" are the studio's own folder names, kept verbatim.
   * Harley-Davidson's trims have been called other things in other places and
   * inventing a tidier name here would put a build on the page that nobody
   * sells; if the studio calls them something else, that is a one-line change
   * to `name` and nothing else.
   */
  {
    id: "harley-davidson-x440-s",
    name: "X440 S",
    manufacturer: "Harley-Davidson",
    render: "/vehicles/harley-davidson-x440-s/cover.webp",
    image: "/vehicles/harley-davidson-x440-s/cover.webp",
    colors: [
      {
        id: "baja-orange",
        name: "Baja Orange",
        swatch: "#C4622A",
        render: "/vehicles/harley-davidson-x440-s/baja-orange.webp",
        image: "/vehicles/harley-davidson-x440-s/baja-orange.webp",
      },
      {
        id: "matte-black",
        name: "Matte Black",
        swatch: "#14161A",
        render: "/vehicles/harley-davidson-x440-s/matte-black.webp",
        image: "/vehicles/harley-davidson-x440-s/matte-black.webp",
      },
    ],
  },
  {
    id: "harley-davidson-x440-t",
    name: "X440 T",
    manufacturer: "Harley-Davidson",
    render: "/vehicles/harley-davidson-x440-t/cover.webp",
    image: "/vehicles/harley-davidson-x440-t/cover.webp",
    colors: [
      {
        id: "pearl-blue",
        name: "Pearl Blue",
        swatch: "#22406E",
        render: "/vehicles/harley-davidson-x440-t/pearl-blue.webp",
        image: "/vehicles/harley-davidson-x440-t/pearl-blue.webp",
      },
      {
        id: "pearl-red",
        name: "Pearl Red",
        swatch: "#A32330",
        render: "/vehicles/harley-davidson-x440-t/pearl-red.webp",
        image: "/vehicles/harley-davidson-x440-t/pearl-red.webp",
      },
      {
        id: "pearl-white",
        name: "Pearl White",
        swatch: "#EDEFF2",
        render: "/vehicles/harley-davidson-x440-t/pearl-white.webp",
        image: "/vehicles/harley-davidson-x440-t/pearl-white.webp",
      },
      {
        id: "vivid-black",
        name: "Vivid Black",
        swatch: "#14161A",
        render: "/vehicles/harley-davidson-x440-t/vivid-black.webp",
        image: "/vehicles/harley-davidson-x440-t/vivid-black.webp",
      },
    ],
  },
  /*
   * The KTM range, ascending: the Dukes, then the RCs, then the Adventures.
   *
   * Sampling the swatches off these renders was tried and does not work. Every
   * KTM in the folder carries an orange trellis frame and orange wheels, so the
   * most saturated paint on a Metallic Silver Duke 200 is the frame, not the
   * tank. The names are what these hexes come from, the same as every other
   * colourway on this page.
   */
  {
    id: "ktm-duke-125",
    name: "Duke 125",
    manufacturer: "KTM",
    render: "/vehicles/ktm-duke-125/cover.webp",
    image: "/vehicles/ktm-duke-125/cover.webp",
    colors: [
      {
        id: "ceramic-white",
        name: "Ceramic White",
        swatch: "#EDEFF2",
        render: "/vehicles/ktm-duke-125/ceramic-white.webp",
        image: "/vehicles/ktm-duke-125/ceramic-white.webp",
      },
      {
        id: "electric-orange",
        name: "Electric Orange",
        swatch: "#E2611F",
        render: "/vehicles/ktm-duke-125/electric-orange.webp",
        image: "/vehicles/ktm-duke-125/electric-orange.webp",
      },
    ],
  },
  {
    id: "ktm-duke-200",
    name: "Duke 200",
    manufacturer: "KTM",
    render: "/vehicles/ktm-duke-200/cover.webp",
    image: "/vehicles/ktm-duke-200/cover.webp",
    colors: [
      {
        id: "electric-orange",
        name: "Electric Orange",
        swatch: "#E2611F",
        render: "/vehicles/ktm-duke-200/electric-orange.webp",
        image: "/vehicles/ktm-duke-200/electric-orange.webp",
      },
      {
        id: "metallic-silver",
        name: "Metallic Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/ktm-duke-200/metallic-silver.webp",
        image: "/vehicles/ktm-duke-200/metallic-silver.webp",
      },
    ],
  },
  {
    id: "ktm-duke-250",
    name: "Duke 250",
    manufacturer: "KTM",
    render: "/vehicles/ktm-duke-250/cover.webp",
    image: "/vehicles/ktm-duke-250/cover.webp",
    colors: [
      {
        id: "electric-orange",
        name: "Electric Orange",
        swatch: "#E2611F",
        render: "/vehicles/ktm-duke-250/electric-orange.webp",
        image: "/vehicles/ktm-duke-250/electric-orange.webp",
      },
      {
        id: "metallic-orange",
        name: "Metallic Orange",
        swatch: "#C85A22",
        render: "/vehicles/ktm-duke-250/metallic-orange.webp",
        image: "/vehicles/ktm-duke-250/metallic-orange.webp",
      },
      /* These two arrived in a folder the studio labelled "ktm duke 250
         (2022)", after the two above were already here. They are two more
         colourways of the same machine rather than a second Duke 250 — the
         page lists machines, not model years, and a client picking a colour is
         choosing paint. Split it in two if the studio means two builds. */
      {
        id: "dark-galvano",
        name: "Dark Galvano",
        swatch: "#4A4F55",
        render: "/vehicles/ktm-duke-250/dark-galvano.webp",
        image: "/vehicles/ktm-duke-250/dark-galvano.webp",
      },
      {
        id: "ebony-black",
        name: "Ebony Black",
        swatch: "#14161A",
        render: "/vehicles/ktm-duke-250/ebony-black.webp",
        image: "/vehicles/ktm-duke-250/ebony-black.webp",
      },
    ],
  },
  {
    id: "ktm-duke-390",
    name: "Duke 390",
    manufacturer: "KTM",
    render: "/vehicles/ktm-duke-390/cover.webp",
    image: "/vehicles/ktm-duke-390/cover.webp",
    colors: [
      {
        id: "dark-galvano",
        name: "Dark Galvano",
        swatch: "#4A4F55",
        render: "/vehicles/ktm-duke-390/dark-galvano.webp",
        image: "/vehicles/ktm-duke-390/dark-galvano.webp",
      },
      {
        id: "liquid-metal",
        name: "Liquid Metal",
        swatch: "#B9BCC0",
        render: "/vehicles/ktm-duke-390/liquid-metal.webp",
        image: "/vehicles/ktm-duke-390/liquid-metal.webp",
      },
    ],
  },
  /* The RC 125's two colourways are named "Black" and "Blue" and nothing else.
     That is what the studio's files say and what KTM's own brochure says, so
     they are not dressed up here. */
  {
    id: "ktm-rc-125",
    name: "RC 125",
    manufacturer: "KTM",
    render: "/vehicles/ktm-rc-125/cover.webp",
    image: "/vehicles/ktm-rc-125/cover.webp",
    colors: [
      {
        id: "black",
        name: "Black",
        swatch: "#14161A",
        render: "/vehicles/ktm-rc-125/black.webp",
        image: "/vehicles/ktm-rc-125/black.webp",
      },
      {
        id: "blue",
        name: "Blue",
        swatch: "#22406E",
        render: "/vehicles/ktm-rc-125/blue.webp",
        image: "/vehicles/ktm-rc-125/blue.webp",
      },
    ],
  },
  {
    id: "ktm-rc-200",
    name: "RC 200",
    manufacturer: "KTM",
    render: "/vehicles/ktm-rc-200/cover.webp",
    image: "/vehicles/ktm-rc-200/cover.webp",
    colors: [
      /* The file arrived as "matallic silver.png". Mapped in the conversion
         script; the studio's copy keeps its own spelling. */
      {
        id: "metallic-silver",
        name: "Metallic Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/ktm-rc-200/metallic-silver.webp",
        image: "/vehicles/ktm-rc-200/metallic-silver.webp",
      },
      /* An orange carrying black, the way Metallic Black Red is a black
         carrying red — so the darker of the two oranges already on the page. */
      {
        id: "orange-black",
        name: "Orange Black",
        swatch: "#C85A22",
        render: "/vehicles/ktm-rc-200/orange-black.webp",
        image: "/vehicles/ktm-rc-200/orange-black.webp",
      },
    ],
  },
  {
    id: "ktm-rc-390",
    name: "RC 390",
    manufacturer: "KTM",
    render: "/vehicles/ktm-rc-390/cover.webp",
    image: "/vehicles/ktm-rc-390/cover.webp",
    colors: [
      {
        id: "electronic-orange",
        name: "Electronic Orange",
        swatch: "#E2611F",
        render: "/vehicles/ktm-rc-390/electronic-orange.webp",
        image: "/vehicles/ktm-rc-390/electronic-orange.webp",
      },
      {
        id: "factory-racing-blue",
        name: "Factory Racing Blue",
        swatch: "#22406E",
        render: "/vehicles/ktm-rc-390/factory-racing-blue.webp",
        image: "/vehicles/ktm-rc-390/factory-racing-blue.webp",
      },
    ],
  },
  {
    id: "ktm-250-adventure",
    name: "250 Adventure",
    manufacturer: "KTM",
    render: "/vehicles/ktm-250-adventure/cover.webp",
    image: "/vehicles/ktm-250-adventure/cover.webp",
    colors: [
      {
        id: "electronic-orange",
        name: "Electronic Orange",
        swatch: "#E2611F",
        render: "/vehicles/ktm-250-adventure/electronic-orange.webp",
        image: "/vehicles/ktm-250-adventure/electronic-orange.webp",
      },
      {
        id: "factory-racing-blue",
        name: "Factory Racing Blue",
        swatch: "#22406E",
        render: "/vehicles/ktm-250-adventure/factory-racing-blue.webp",
        image: "/vehicles/ktm-250-adventure/factory-racing-blue.webp",
      },
    ],
  },
  /* The folder is "ktm 390 avd (2022)". There is no such machine — "avd" is a
     typo for "adv" and this is the 390 Adventure. */
  {
    id: "ktm-390-adventure",
    name: "390 Adventure",
    manufacturer: "KTM",
    render: "/vehicles/ktm-390-adventure/cover.webp",
    image: "/vehicles/ktm-390-adventure/cover.webp",
    colors: [
      {
        id: "metallic-silver",
        name: "Metallic Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/ktm-390-adventure/metallic-silver.webp",
        image: "/vehicles/ktm-390-adventure/metallic-silver.webp",
      },
      {
        id: "racing-blue",
        name: "Racing Blue",
        swatch: "#22406E",
        render: "/vehicles/ktm-390-adventure/racing-blue.webp",
        image: "/vehicles/ktm-390-adventure/racing-blue.webp",
      },
    ],
  },
  {
    id: "yamaha-r15",
    name: "R15",
    manufacturer: "Yamaha",
    render: "/vehicles/yamaha-r15/cover.webp",
    image: "/vehicles/yamaha-r15/cover.webp",
    colors: [
      {
        id: "dark-knight-black",
        name: "Dark Knight",
        swatch: "#14161A",
        render: "/vehicles/yamaha-r15/dark-knight-black.webp",
        image: "/vehicles/yamaha-r15/dark-knight-black.webp",
      },
      {
        id: "metallic-red",
        name: "Metallic Red",
        swatch: "#A32330",
        render: "/vehicles/yamaha-r15/metallic-red.webp",
        image: "/vehicles/yamaha-r15/metallic-red.webp",
      },
      {
        id: "racing-blue",
        name: "Racing Blue",
        swatch: "#22406E",
        render: "/vehicles/yamaha-r15/racing-blue.webp",
        image: "/vehicles/yamaha-r15/racing-blue.webp",
      },
    ],
  },
  {
    id: "yamaha-mt-15",
    name: "MT-15",
    manufacturer: "Yamaha",
    /* Cover is Metallic Black rather than the first file the studio sent.
       Black is what most of the enquiries for this machine ask for, and the
       cover is a copy of a colourway's file either way. */
    render: "/vehicles/yamaha-mt-15/cover.webp",
    image: "/vehicles/yamaha-mt-15/cover.webp",
    colors: [
      {
        id: "metallic-black",
        name: "Metallic Black",
        swatch: "#14161A",
        render: "/vehicles/yamaha-mt-15/metallic-black.webp",
        image: "/vehicles/yamaha-mt-15/metallic-black.webp",
      },
      {
        /* DLX is the studio's own filename and it is kept. It is not a trim
           split of the kind the X440's S and T are: same machine, same shot,
           red wheels instead of black. The swatch follows Metallic Black Red
           above - a black carrying red, not a red. */
        id: "metallic-black-dlx",
        name: "Metallic Black DLX",
        swatch: "#2A1216",
        render: "/vehicles/yamaha-mt-15/metallic-black-dlx.webp",
        image: "/vehicles/yamaha-mt-15/metallic-black-dlx.webp",
      },
      {
        id: "ice-storm",
        name: "Ice Storm",
        swatch: "#EDEFF2",
        render: "/vehicles/yamaha-mt-15/ice-storm.webp",
        image: "/vehicles/yamaha-mt-15/ice-storm.webp",
      },
      {
        /* No cyan among the constants this file already reuses - the nearest,
           #1E6E6A, is a teal and reads green beside this paint. Inferred from
           the name like the rest, not sampled. */
        id: "metallic-silver-cyan",
        name: "Metallic Silver Cyan",
        swatch: "#2E93B0",
        render: "/vehicles/yamaha-mt-15/metallic-silver-cyan.webp",
        image: "/vehicles/yamaha-mt-15/metallic-silver-cyan.webp",
      },
      {
        id: "vivid-violet-metallic",
        name: "Vivid Violet Metallic",
        swatch: "#4A3468",
        render: "/vehicles/yamaha-mt-15/vivid-violet-metallic.webp",
        image: "/vehicles/yamaha-mt-15/vivid-violet-metallic.webp",
      },
    ],
  },
  /*
   * The Apache RTX 300, as three machines rather than one.
   *
   * TVS sells it as Base, Top and BTO, and the studio asked for the split with
   * the same four colourways under each -- the same argument the XPulse 210 and
   * the X440's S and T are already split on: a client picks the machine they
   * own, and a trim they cannot find is a machine the site does not do.
   *
   * The renders are the same four frames three times over, and they are copied
   * rather than shared. One folder pointed at by three machines was tried
   * first and `verify_vehicles.py` rejected all thirty-two paths: it holds the
   * invariant that a path's folder is its machine's id, which exists because a
   * regex once handed five colourways their neighbour's render and no diff
   * review caught it. That check is worth more than the 540kB, and a trim that
   * ever gets a shot of its own has somewhere to put it.
   *
   * TVS is new to this file. The Apache was the fourth-largest cluster in the
   * studio's enquiry sheet and had nothing to pick.
   */
  {
    id: "tvs-apache-rtx-300-base",
    name: "Apache RTX 300 Base",
    manufacturer: "TVS",
    render: "/vehicles/tvs-apache-rtx-300-base/cover.webp",
    image: "/vehicles/tvs-apache-rtx-300-base/cover.webp",
    colors: [
      {
        /* The four swatches here are sampled off the renders rather than
           inferred from the names, which is how most of this file was picked.
           Three of these four names could be almost anything -- "Tarn Bronze"
           is a light warm taupe and not the brass a reader would guess. */
        id: "lightning-black",
        name: "Lightning Black",
        swatch: "#17181A",
        render: "/vehicles/tvs-apache-rtx-300-base/lightning-black.webp",
        image: "/vehicles/tvs-apache-rtx-300-base/lightning-black.webp",
      },
      {
        id: "metallic-blue",
        name: "Metallic Blue",
        swatch: "#2059AD",
        render: "/vehicles/tvs-apache-rtx-300-base/metallic-blue.webp",
        image: "/vehicles/tvs-apache-rtx-300-base/metallic-blue.webp",
      },
      {
        id: "tarn-bronze",
        name: "Tarn Bronze",
        swatch: "#B0A79E",
        render: "/vehicles/tvs-apache-rtx-300-base/tarn-bronze.webp",
        image: "/vehicles/tvs-apache-rtx-300-base/tarn-bronze.webp",
      },
      {
        id: "viper-green",
        name: "Viper Green",
        swatch: "#8C9A5A",
        render: "/vehicles/tvs-apache-rtx-300-base/viper-green.webp",
        image: "/vehicles/tvs-apache-rtx-300-base/viper-green.webp",
      },
    ],
  },
  {
    id: "tvs-apache-rtx-300-top",
    name: "Apache RTX 300 Top",
    manufacturer: "TVS",
    render: "/vehicles/tvs-apache-rtx-300-top/cover.webp",
    image: "/vehicles/tvs-apache-rtx-300-top/cover.webp",
    colors: [
      {
        /* The four swatches here are sampled off the renders rather than
           inferred from the names, which is how most of this file was picked.
           Three of these four names could be almost anything -- "Tarn Bronze"
           is a light warm taupe and not the brass a reader would guess. */
        id: "lightning-black",
        name: "Lightning Black",
        swatch: "#17181A",
        render: "/vehicles/tvs-apache-rtx-300-top/lightning-black.webp",
        image: "/vehicles/tvs-apache-rtx-300-top/lightning-black.webp",
      },
      {
        id: "metallic-blue",
        name: "Metallic Blue",
        swatch: "#2059AD",
        render: "/vehicles/tvs-apache-rtx-300-top/metallic-blue.webp",
        image: "/vehicles/tvs-apache-rtx-300-top/metallic-blue.webp",
      },
      {
        id: "tarn-bronze",
        name: "Tarn Bronze",
        swatch: "#B0A79E",
        render: "/vehicles/tvs-apache-rtx-300-top/tarn-bronze.webp",
        image: "/vehicles/tvs-apache-rtx-300-top/tarn-bronze.webp",
      },
      {
        id: "viper-green",
        name: "Viper Green",
        swatch: "#8C9A5A",
        render: "/vehicles/tvs-apache-rtx-300-top/viper-green.webp",
        image: "/vehicles/tvs-apache-rtx-300-top/viper-green.webp",
      },
    ],
  },
  {
    /* Build To Order, spelled out nowhere on the card because TVS does not
       spell it out either -- it is what the configurator on their own site
       calls it, and it is what an owner will call it. */
    id: "tvs-apache-rtx-300-bto",
    name: "Apache RTX 300 BTO",
    manufacturer: "TVS",
    render: "/vehicles/tvs-apache-rtx-300-bto/cover.webp",
    image: "/vehicles/tvs-apache-rtx-300-bto/cover.webp",
    colors: [
      {
        /* The four swatches here are sampled off the renders rather than
           inferred from the names, which is how most of this file was picked.
           Three of these four names could be almost anything -- "Tarn Bronze"
           is a light warm taupe and not the brass a reader would guess. */
        id: "lightning-black",
        name: "Lightning Black",
        swatch: "#17181A",
        render: "/vehicles/tvs-apache-rtx-300-bto/lightning-black.webp",
        image: "/vehicles/tvs-apache-rtx-300-bto/lightning-black.webp",
      },
      {
        id: "metallic-blue",
        name: "Metallic Blue",
        swatch: "#2059AD",
        render: "/vehicles/tvs-apache-rtx-300-bto/metallic-blue.webp",
        image: "/vehicles/tvs-apache-rtx-300-bto/metallic-blue.webp",
      },
      {
        id: "tarn-bronze",
        name: "Tarn Bronze",
        swatch: "#B0A79E",
        render: "/vehicles/tvs-apache-rtx-300-bto/tarn-bronze.webp",
        image: "/vehicles/tvs-apache-rtx-300-bto/tarn-bronze.webp",
      },
      {
        id: "viper-green",
        name: "Viper Green",
        swatch: "#8C9A5A",
        render: "/vehicles/tvs-apache-rtx-300-bto/viper-green.webp",
        image: "/vehicles/tvs-apache-rtx-300-bto/viper-green.webp",
      },
    ],
  },
];
