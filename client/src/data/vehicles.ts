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
        image: PLACEHOLDER,
    colors: [
      {
        id: "kamet-white",
        name: "Kamet White",
        swatch: "#EDEFF2",
        render: "/vehicles/himalayan-450/kamet-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "kaza-brown",
        name: "Kaza Brown",
        swatch: "#5E4230",
        render: "/vehicles/himalayan-450/kaza-brown.webp",
        image: PLACEHOLDER,
      },
      {
        id: "hanle-black",
        name: "Hanle Black",
        swatch: "#14161A",
        render: "/vehicles/himalayan-450/hanle-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "slate-poppy-blue",
        name: "Slate Poppy Blue",
        swatch: "#C4453C",
        render: "/vehicles/himalayan-450/slate-poppy-blue.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
        pending: true,
      },
    ],
  },
  {
    id: "hunter-350",
    name: "Hunter 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/hunter-350/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "london-red",
        name: "London Red",
        swatch: "#A32330",
        render: "/vehicles/hunter-350/london-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rio-white",
        name: "Rio White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/rio-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "tokyo-black",
        name: "Tokyo Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/tokyo-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "dapper-white",
        name: "Dapper White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/dapper-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "moonshot-white",
        name: "Moonshot White",
        swatch: "#EDEFF2",
        render: "/vehicles/hunter-350/moonshot-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "mumbai-yellow",
        name: "Mumbai Yellow",
        swatch: "#D8A62A",
        render: "/vehicles/hunter-350/mumbai-yellow.webp",
        image: PLACEHOLDER,
      },
      {
        id: "tarmac-black",
        name: "Tarmac Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/tarmac-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "graphite-grey",
        name: "Graphite Grey",
        swatch: "#6E7378",
        render: "/vehicles/hunter-350/graphite-grey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "dapper-grey",
        name: "Dapper Grey",
        swatch: "#6E7378",
        render: "/vehicles/hunter-350/dapper-grey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "factory-black",
        name: "Factory Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/factory-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rebel-blue",
        name: "Rebel Blue",
        swatch: "#22406E",
        render: "/vehicles/hunter-350/rebel-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rebel-red",
        name: "Rebel Red",
        swatch: "#A32330",
        render: "/vehicles/hunter-350/rebel-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rebel-black",
        name: "Rebel Black",
        swatch: "#14161A",
        render: "/vehicles/hunter-350/rebel-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "dapper-green",
        name: "Dapper Green",
        swatch: "#25543B",
        render: "/vehicles/hunter-350/dapper-green.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "guerrilla-450",
    name: "Guerrilla 450",
    manufacturer: "Royal Enfield",
    render: "/vehicles/guerrilla-450/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "apex-black",
        name: "Apex Black",
        swatch: "#14161A",
        render: "/vehicles/guerrilla-450/apex-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "apex-green",
        name: "Apex Green",
        swatch: "#25543B",
        render: "/vehicles/guerrilla-450/apex-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "apex-red",
        name: "Apex Red",
        swatch: "#A32330",
        render: "/vehicles/guerrilla-450/apex-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "brava-blue",
        name: "Brava Blue",
        swatch: "#22406E",
        render: "/vehicles/guerrilla-450/brava-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "smoke-silver",
        name: "Smoke Silver",
        swatch: "#C3C7CC",
        render: "/vehicles/guerrilla-450/smoke-silver.webp",
        image: PLACEHOLDER,
      },
      {
        id: "shadow-ash",
        name: "Shadow Ash",
        swatch: "#B9BCC0",
        render: "/vehicles/guerrilla-450/shadow-ash.webp",
        image: PLACEHOLDER,
      },
      {
        id: "twilight-blue",
        name: "Twilight Blue",
        swatch: "#22406E",
        render: "/vehicles/guerrilla-450/twilight-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "gold-dip",
        name: "Gold Dip",
        swatch: "#B08A3C",
        render: "/vehicles/guerrilla-450/gold-dip.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "bear-650",
    name: "Bear 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/bear-650/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "boardwalk-white",
        name: "Boardwalk White",
        swatch: "#EDEFF2",
        render: "/vehicles/bear-650/boardwalk-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "golden-shadow",
        name: "Golden Shadow",
        swatch: "#B08A3C",
        render: "/vehicles/bear-650/golden-shadow.webp",
        image: PLACEHOLDER,
      },
      {
        id: "two-four-nine",
        name: "Two Four Nine",
        swatch: "#6E7378",
        render: "/vehicles/bear-650/two-four-nine.webp",
        image: PLACEHOLDER,
      },
      {
        id: "wild-honey",
        name: "Wild Honey",
        swatch: "#B5822E",
        render: "/vehicles/bear-650/wild-honey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "petrol-green",
        name: "Petrol Green",
        swatch: "#25543B",
        render: "/vehicles/bear-650/petrol-green.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "classic-350",
    name: "Classic 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-350/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "emerald",
        name: "Emerald",
        swatch: "#1F6B4A",
        render: "/vehicles/classic-350/emerald.webp",
        image: PLACEHOLDER,
      },
      {
        id: "madras-red",
        name: "Madras Red",
        swatch: "#A32330",
        render: "/vehicles/classic-350/madras-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "medallion-bronze",
        name: "Medallion Bronze",
        swatch: "#7A5A34",
        render: "/vehicles/classic-350/medallion-bronze.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "stealth-black",
        name: "Stealth Black",
        swatch: "#14161A",
        render: "/vehicles/classic-350/stealth-black.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "ash-white",
        name: "Ash White",
        swatch: "#EDEFF2",
        render: "/vehicles/classic-350/ash-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "halcyon-black",
        name: "Halcyon Black",
        swatch: "#14161A",
        render: "/vehicles/classic-350/halcyon-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "redditch-red",
        name: "Redditch Red",
        swatch: "#A32330",
        render: "/vehicles/classic-350/redditch-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "chrome-bronze",
        name: "Chrome Bronze",
        swatch: "#C9CDD2",
        render: "/vehicles/classic-350/chrome-bronze.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "redditch-grey",
        name: "Redditch Grey",
        swatch: "#6E7378",
        render: "/vehicles/classic-350/redditch-grey.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "classic-500",
    name: "Classic 500",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-500/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "desert-storm",
        name: "Desert Storm",
        swatch: "#5A5F66",
        render: "/vehicles/classic-500/desert-storm.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "classic-650",
    name: "Classic 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/classic-650/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "black-chrome",
        name: "Black Chrome",
        swatch: "#C9CDD2",
        render: "/vehicles/classic-650/black-chrome.webp",
        image: PLACEHOLDER,
      },
      {
        id: "teal",
        name: "Teal",
        swatch: "#1E6E6A",
        render: "/vehicles/classic-650/teal.webp",
        image: PLACEHOLDER,
      },
      {
        id: "vallam-red",
        name: "Vallam Red",
        swatch: "#A32330",
        render: "/vehicles/classic-650/vallam-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "bruntingthorpe-blue",
        name: "Bruntingthorpe Blue",
        swatch: "#22406E",
        render: "/vehicles/classic-650/bruntingthorpe-blue.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "interceptor-650",
    name: "Interceptor 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/interceptor-650/cover.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "sunset-strip",
        name: "Sunset Strip",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/sunset-strip.webp",
        image: PLACEHOLDER,
      },
      {
        id: "canyon-red",
        name: "Canyon Red",
        swatch: "#A32330",
        render: "/vehicles/interceptor-650/canyon-red.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "mark-2",
        name: "Mark 2",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/mark-2.webp",
        image: PLACEHOLDER,
      },
      {
        id: "mark-three",
        name: "Mark Three",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/mark-three.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "ravishing-red",
        name: "Ravishing Red",
        swatch: "#A32330",
        render: "/vehicles/interceptor-650/ravishing-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "downtown-drag",
        name: "Downtown Drag",
        swatch: "#6E7378",
        render: "/vehicles/interceptor-650/downtown-drag.webp",
        image: PLACEHOLDER,
      },
      {
        id: "black-pearl",
        name: "Black Pearl",
        swatch: "#14161A",
        render: "/vehicles/interceptor-650/black-pearl.webp",
        image: PLACEHOLDER,
      },
      {
        id: "silver-spectre",
        name: "Silver Spectre",
        swatch: "#C3C7CC",
        render: "/vehicles/interceptor-650/silver-spectre.webp",
        image: PLACEHOLDER,
      },
      {
        id: "ventura-blue",
        name: "Ventura Blue",
        swatch: "#22406E",
        render: "/vehicles/interceptor-650/ventura-blue.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "continental-gt-650",
    name: "Continental GT 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/continental-gt-650/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "british-racing-green",
        name: "British Racing Green",
        swatch: "#25543B",
        render: "/vehicles/continental-gt-650/british-racing-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "mr-clean",
        name: "Mr. Clean",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/mr-clean.webp",
        image: PLACEHOLDER,
      },
      {
        id: "slipstream-blue",
        name: "Slipstream Blue",
        swatch: "#22406E",
        render: "/vehicles/continental-gt-650/slipstream-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "apex-grey",
        name: "Apex Grey",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/apex-grey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rocker-red",
        name: "Rocker Red",
        swatch: "#A32330",
        render: "/vehicles/continental-gt-650/rocker-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "dux-deluxe",
        name: "Dux Deluxe",
        swatch: "#6E7378",
        render: "/vehicles/continental-gt-650/dux-deluxe.webp",
        image: PLACEHOLDER,
      },
      {
        id: "ventura-storm",
        name: "Ventura Storm",
        swatch: "#5A5F66",
        render: "/vehicles/continental-gt-650/ventura-storm.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "super-meteor-650",
    name: "Super Meteor 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/super-meteor-650/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "astral-black",
        name: "Astral Black",
        swatch: "#14161A",
        render: "/vehicles/super-meteor-650/astral-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "celestial-blue",
        name: "Celestial Blue",
        swatch: "#22406E",
        render: "/vehicles/super-meteor-650/celestial-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "celestial-red",
        name: "Celestial Red",
        swatch: "#A32330",
        render: "/vehicles/super-meteor-650/celestial-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "interstellar-green",
        name: "Interstellar Green",
        swatch: "#25543B",
        render: "/vehicles/super-meteor-650/interstellar-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "interstellar-grey",
        name: "Interstellar Grey",
        swatch: "#6E7378",
        render: "/vehicles/super-meteor-650/interstellar-grey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "astral-blue",
        name: "Astral Blue",
        swatch: "#22406E",
        render: "/vehicles/super-meteor-650/astral-blue.webp",
        image: PLACEHOLDER,
        pending: true,
      },
      {
        id: "astral-green",
        name: "Astral Green",
        swatch: "#25543B",
        render: "/vehicles/super-meteor-650/astral-green.webp",
        image: PLACEHOLDER,
        pending: true,
      },
    ],
  },
  {
    id: "meteor-350",
    name: "Meteor 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/meteor-350/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "stellar-marine-blue",
        name: "Stellar Marine Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/stellar-marine-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "supernova-black",
        name: "Supernova Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/supernova-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-grey",
        name: "Fireball Grey",
        swatch: "#6E7378",
        render: "/vehicles/meteor-350/fireball-grey.webp",
        image: PLACEHOLDER,
      },
      {
        id: "aurora-retro-green",
        name: "Aurora Retro Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/aurora-retro-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "aurora-red",
        name: "Aurora Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/aurora-red.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
      },
      {
        id: "sundowner-orange",
        name: "Sundowner Orange",
        swatch: "#C4622A",
        render: "/vehicles/meteor-350/sundowner-orange.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-pure-black",
        name: "Fireball Pure Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/fireball-pure-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-matt-green",
        name: "Fireball Matt Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/fireball-matt-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-blue",
        name: "Fireball Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/fireball-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-red",
        name: "Fireball Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/fireball-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "fireball-yellow",
        name: "Fireball Yellow",
        swatch: "#D8A62A",
        render: "/vehicles/meteor-350/fireball-yellow.webp",
        image: PLACEHOLDER,
      },
      {
        id: "stellar-black",
        name: "Stellar Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/stellar-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "stellar-red",
        name: "Stellar Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/stellar-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "supernova-blue",
        name: "Supernova Blue",
        swatch: "#22406E",
        render: "/vehicles/meteor-350/supernova-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "supernova-red",
        name: "Supernova Red",
        swatch: "#A32330",
        render: "/vehicles/meteor-350/supernova-red.webp",
        image: PLACEHOLDER,
      },
      {
        id: "supernova-brown",
        name: "Supernova Brown",
        swatch: "#5E4230",
        render: "/vehicles/meteor-350/supernova-brown.webp",
        image: PLACEHOLDER,
      },
      {
        id: "aurora-black",
        name: "Aurora Black",
        swatch: "#14161A",
        render: "/vehicles/meteor-350/aurora-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "aurora-green",
        name: "Aurora Green",
        swatch: "#25543B",
        render: "/vehicles/meteor-350/aurora-green.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "shotgun-650",
    name: "Shotgun 650",
    manufacturer: "Royal Enfield",
    render: "/vehicles/shotgun-650/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "stencil-white",
        name: "Stencil White",
        swatch: "#EDEFF2",
        render: "/vehicles/shotgun-650/stencil-white.webp",
        image: PLACEHOLDER,
      },
      {
        id: "drill-green",
        name: "Drill Green",
        swatch: "#25543B",
        render: "/vehicles/shotgun-650/drill-green.webp",
        image: PLACEHOLDER,
      },
      {
        id: "plasma-blue",
        name: "Plasma Blue",
        swatch: "#22406E",
        render: "/vehicles/shotgun-650/plasma-blue.webp",
        image: PLACEHOLDER,
      },
      {
        id: "sheet-metal-grey",
        name: "Sheet Metal Grey",
        swatch: "#6E7378",
        render: "/vehicles/shotgun-650/sheet-metal-grey.webp",
        image: PLACEHOLDER,
      },
    ],
  },
  {
    id: "goan-classic-350",
    name: "Goan Classic 350",
    manufacturer: "Royal Enfield",
    render: "/vehicles/goan-classic-350/cover.webp",
        image: PLACEHOLDER,
    colors: [
      {
        id: "purple-haze",
        name: "Purple Haze",
        swatch: "#4A3468",
        render: "/vehicles/goan-classic-350/purple-haze.webp",
        image: PLACEHOLDER,
      },
      {
        id: "shack-black",
        name: "Shack Black",
        swatch: "#14161A",
        render: "/vehicles/goan-classic-350/shack-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "trip-teal",
        name: "Trip Teal",
        swatch: "#1E6E6A",
        render: "/vehicles/goan-classic-350/trip-teal.webp",
        image: PLACEHOLDER,
      },
      {
        id: "rave-red",
        name: "Rave Red",
        swatch: "#A32330",
        render: "/vehicles/goan-classic-350/rave-red.webp",
        image: PLACEHOLDER,
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
        image: PLACEHOLDER,
    colors: [
      {
        id: "cannon-black",
        name: "Cannon Black",
        swatch: "#14161A",
        render: "/vehicles/bullet-650/cannon-black.webp",
        image: PLACEHOLDER,
      },
      {
        id: "battleship-blue",
        name: "Battleship Blue",
        swatch: "#22406E",
        render: "/vehicles/bullet-650/battleship-blue.webp",
        image: PLACEHOLDER,
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
    image: PLACEHOLDER,
    colors: [
      {
        id: "metallic-black-red",
        name: "Metallic Black Red",
        /* Inferred from the name like every other swatch on this page: a black
           carrying red rather than a red. Sample it from the render when there
           is one. */
        swatch: "#2A1216",
        render: "/vehicles/pulsar-150/metallic-black-red.webp",
        image: PLACEHOLDER,
      },
    ],
  },
];
