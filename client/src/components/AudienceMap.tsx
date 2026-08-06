import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ChoroplethChart,
  ChoroplethFeatureComponent,
  ChoroplethGraticule,
  ChoroplethTooltip,
  useChoropleth,
} from "@/components/charts/choropleth";
import { PatternLines } from "@/components/charts/visx-pattern";
import { audienceFor, shareBucket } from "@/data/audience";

/**
 * Where the reels were watched.
 *
 * The geojson is fetched rather than imported: it is 232KB of coordinates that
 * nothing above the fold needs, and bundling it would put the whole world into
 * the entry chunk for a map most visitors scroll past. Fetched once, cached by
 * the browser like any other static asset.
 *
 * Colour is bucketed, not a linear ramp — India is ~97.6% of the total and
 * second place is ~0.8%, so a linear scale paints one country and leaves every
 * other viewer country indistinguishable from empty ocean.
 */

type ChoroplethData = Parameters<typeof ChoroplethChart>[0]["data"];

const FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/* Percent of the total, not the mean across reels — see data/audience.ts. The
   two rank identically, so the buckets below are unaffected. */
const getShare = (feature: { properties?: { name?: string } | null }) =>
  audienceFor(feature.properties?.name ?? undefined)?.percentOfTotal;

/**
 * Lets the country list beside the map drive the map's hover.
 *
 * The map dims every feature but the hovered one off a single index, so that
 * index is the whole of what a country name has to set — the highlight the
 * pointer produces and the highlight the list produces are then the same
 * thing rather than two treatments that drift apart.
 *
 * Renders nothing; it is a child only to be inside the chart's provider.
 */
function ListHoverBridge({ country }: { country: string | null }) {
  const { features, setHoveredFeatureIndex } = useChoropleth();

  /*
   * Built once, not walked per hover.
   *
   * This was a `findIndex` over ~180 countries on every pointer move between
   * rows, and each hit re-rendered the map. On its own that is cheap; landing
   * in the middle of a scroll, on the same frames the smooth scroll and the
   * charts are already using, it was enough to show. The lookup is now a Map
   * keyed on the name the geojson uses.
   */
  const indexByName = useMemo(() => {
    const m = new Map<string, number>();
    features.forEach((f, i) => {
      const name = f.properties?.name;
      if (name) m.set(name, i);
    });
    return m;
  }, [features]);

  useEffect(() => {
    if (!country) {
      setHoveredFeatureIndex(null);
      return;
    }
    setHoveredFeatureIndex(indexByName.get(country) ?? null);
  }, [country, indexByName, setHoveredFeatureIndex]);

  return null;
}

export function AudienceMap({
  /** Country the list beside the map is hovering, if any. */
  hoveredCountry = null,
}: {
  hoveredCountry?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const [geo, setGeo] = useState<ChoroplethData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/geo/world-countries.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => live && setGeo(json))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  // The table beside this map carries the same figures, so a map that cannot
  // load is a missing decoration rather than missing information. It says so
  // and takes no space arguing about it.
  if (failed) {
    return (
      <p className="text-sm text-[#B8C4D6]">
        The map could not load. The figures are listed beside it.
      </p>
    );
  }

  if (!geo) {
    return <div className="w-full" style={{ aspectRatio: "16 / 9" }} />;
  }

  return (
    <ChoroplethChart
      data={geo}
      aspectRatio="16 / 9"
      animationDuration={reduceMotion ? 0 : 1100}
    >
      <ChoroplethGraticule />

      {/* Every country gets the hatch first, so the ones with no viewers read
          as land rather than as a hole in the map. */}
      <ChoroplethFeatureComponent
        getFeaturePattern={() => "audience-empty"}
        patterns={
          <PatternLines
            id="audience-empty"
            height={8}
            width={8}
            orientation={["diagonal"]}
            /* Off the ramp on purpose. The hatch means "no viewers", and any
               step of the scale would give the empty countries a reading on a
               scale they are not on — --chart-5 in particular is now the fill
               India carries. Same violet family, well below its darkest step. */
            stroke="#2A1B4A"
            strokeWidth={1}
          />
        }
      />

      {/* Then the countries that actually have a share paint over it. */}
      <ChoroplethFeatureComponent
        getFeatureColor={(feature) => {
          const share = getShare(feature);
          return share === undefined
            ? "transparent"
            : FILLS[shareBucket(share)];
        }}
      />

      <ChoroplethTooltip
        getFeatureValue={(feature) => getShare(feature)}
        formatValue={(value) => `${value.toFixed(2)}%`}
        valueLabel="Share of total views"
      />

      <ListHoverBridge country={hoveredCountry} />
    </ChoroplethChart>
  );
}
