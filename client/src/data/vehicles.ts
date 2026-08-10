/**
 * The render every card falls back to until the real ones exist.
 *
 * One of the studio's own frames rather than a stock photograph or a broken
 * link. It is obviously a stand-in — the same picture on every machine — which
 * is the point: it does not pretend to be the colour it sits under.
 */
const PLACEHOLDER = "/showcase/too-clean.webp";

export interface VehicleColor {
  id: string;
  name: string;
  /** What is shown today. See PLACEHOLDER. */
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
  colors: VehicleColor[];
}

/*
 * The machines the studio works with, as supplied: the Royal Enfield range, and
 * whatever else has been added since.
 *
 * Two things about this data are placeholders and are meant to be replaced,
 * and neither is hidden:
 *
 * 1. **`render` is a promise, `image` is what loads today.** Every colourway
 *    already names the path its own render will live at —
 *    `/vehicles/<machine>/<colour>.webp` — while `image` points at a single
 *    stand-in frame. Making a render real is dropping the file there and
 *    switching one field.
 *
 * 2. **The swatch hexes are inferred from the colour names**, not sampled from
 *    the paint. "Kaza Brown" is a brown, "Tokyo Black" is a black, and a name
 *    with no hue in it at all — Two Four Nine, Mark 2, Dux Deluxe — gets a
 *    neutral. They are close enough to tell one chip from another and are not
 *    accurate enough to choose a colour from. Sample them from the renders when
 *    the renders exist.
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
        id: "mana-black",
        name: "Mana Black",
        swatch: "#14161A",
        render: "/vehicles/himalayan-450/mana-black.webp",
        image: PLACEHOLDER,
        pending: true,
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
        id: "purple-haze",
        name: "Purple Haze",
        swatch: "#4A3468",
        render: "/vehicles/classic-350/purple-haze.webp",
        image: PLACEHOLDER,
      },
      {
        id: "shack-black",
        name: "Shack Black",
        swatch: "#14161A",
        render: "/vehicles/classic-350/shack-black.webp",
        image: PLACEHOLDER,
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
        id: "trip-teal-green",
        name: "Trip Teal Green",
        swatch: "#1E6E6A",
        render: "/vehicles/classic-350/trip-teal-green.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
    colors: [
      {
        id: "battalion-black",
        name: "Battalion Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/battalion-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "standard-black",
        name: "Standard Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/standard-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "standard-maroon",
        name: "Standard Maroon",
        swatch: "#5E1F26",
        render: "/vehicles/bullet-350/standard-maroon.webp",
        image: PLACEHOLDER,
      },
      {
        id: "black-gold",
        name: "Black Gold",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/black-gold.webp",
        image: PLACEHOLDER,
      },
      {
        id: "military-black",
        name: "Military Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-350/military-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "military-silver-black",
        name: "Military Silver Black",
        swatch: "#C3C7CC",
        render: "/vehicles/bullet-350/military-silver-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "military-silver-red",
        name: "Military Silver Red",
        swatch: "#C3C7CC",
        render: "/vehicles/bullet-350/military-silver-red.webp",
        image: PLACEHOLDER,
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
    ],
  },
];
