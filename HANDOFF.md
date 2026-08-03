# Cold Chain Theory — Project Status

For picking this back up in a new Claude Code session. Repo:
`github.com/VivekVagale/cct` (public), deployed on Vercel (project
`cold-chain-theory`, team `vivekdv1986-9419's projects`).

**Work branch: `claude/cct-project-status-aqd1f8`** — 12 commits ahead of `main`,
all pushed. `main` is still at the pre-session state; nothing has been merged.

## Stack

React + TypeScript + Vite + Tailwind + Framer Motion. Repo root = project root.
`vercel.json` sets `buildCommand: vite build`, `outputDirectory: dist/public`.
pnpm is canonical (`pnpm-lock.yaml`); don't let a `package-lock.json` reappear.
Fonts: Fraunces (`font-display`) + Inter (`font-sans`) via Google Fonts in
`client/index.html`.

Always run `npx tsc --noEmit` and `npx vite build` before pushing. There is one
**pre-existing, harmless** TS error — `client/src/const.ts` can't find
`@shared/const`. It predates all of this and has never blocked a build. Anything
else is yours.

## Current section order

`client/src/App.tsx`: Navigation → Hero → WorkShowcase → CinematicLine → About →
CreativeProcess → CGIExperiences → CinematicLine → Booking → Testimonials → FAQ →
Footer.

No Featured Projects section — built once, explicitly removed, do not re-add.
No Marquee — replaced by WorkShowcase this session.

## Design system

Background `#05070A`, surface `#0D1117`, text `#F5F7FA` / `#B8C4D6`, accent white
(hover `#E5E5E5`). Cyan appears only where the mascot's own chain does.

Data-driven content in `client/src/data/`: `mascot.ts`, `content.ts` (process
stages, CGI experiences, testimonials, FAQ), `vehicles.ts`, `projects.ts`,
`heroSequence.ts` (generated — do not hand-edit).

## Hero — the bulk of this session's work

`client/src/components/Hero.tsx` + `ui/ScrollImageSequence.tsx`.

A scroll-driven **image sequence on a canvas**, not a video. The old MP4 scrub was
janky because the clip had two keyframes across its whole length, so nearly every
scroll position forced the decoder to hunt and re-decode. Pre-decoded frames
remove the decoder from the path entirely.

**Source**: viv's 4K 60fps master (44.9 Mbps), on branch `hero-src` under
`video/`. Frames are built by `tools/build_hero_frames.py` → 298 WebP at
1920×1080, 12 MB. Frame density is ~1 frame per 11px of scroll, finer than a
single trackpad event moves.

**The frames are opaque — the backdrop is deliberately NOT keyed out.** Keying was
tried and abandoned: the character's black clothing meets the black backdrop with
no edge between them (identical pixel values in places), so any matte is guesswork
and left visible fringing plus a frame-shaped rectangle over the starfield. Don't
retry this without a source that has a real alpha channel.

**The pin has three phases** (constants at the top of `Hero.tsx`), all while the
section is still sticky so nothing slides vertically:

| phase | range | what happens |
|---|---|---|
| assembly | `0 → 0.78` | sequence scrubs |
| dissolve | `0.78 → 0.90` | frames fade out, starfield fades in, static pose fades in |
| hold | `0.90 → 1.0` | mascot breathing over stars, CTA visible |

The starfield **must** cross-fade against the frames, not simply rise behind them
— behind opaque frames it reaches full opacity while invisible and then appears
all at once. `App.tsx` owns a `galaxyOpacity` MotionValue that Hero writes to;
it's a MotionValue and not state on purpose (see Gotchas).

**Pose alignment**: at the end, the opaque final frame crossfades to the
transparent `neutral.webp`. It is positioned at the character's measured position
in the final frame — **90.6% of frame height, centred 49.9% / 54.7%** — inside a
box reproducing the canvas' `cover` geometry. **Re-measure these three numbers if
the source clip's framing ever changes.** The pose is a different render (wider
framing, smaller chain), so the handover is perceptible by design; the long
overlap makes it read as settling rather than a cut.

## Mascot

`client/src/components/Mascot.tsx`, poses in `client/src/data/mascot.ts`, images
`client/public/mascot/*.webp` (10 poses, 1.4 MB total).

**Never redesign, recolour or restyle.** Cut out of black-background renders by
`tools/cutout_poses.py`.

**`sizing` prop matters.** `"width"` (default) or `"height"`. Do NOT try to flip
the image's axis from a call site via `[&>img]:` classes — the component's own
`w-full h-auto` stays on the element, both axes end up constrained, and it renders
`object-fit: fill`. That shipped for a while and squashed every pose by 11–48%.

Pose names had drifted and were corrected: `neutral` is the **front-facing**
render; the tight three-quarter shot is `sideCloseUp`. There is no true
hand-on-chin thinking pose — Discovery uses `sideCloseUp` as a stand-in.
`projectReady` and `thankYou` are cut out and available but **unused**.

## Sections

- **WorkShowcase** (`WorkShowcase.tsx`) — full-viewport draggable WebGL sphere,
  React Bits `InfiniteMenu` vendored into `ui/InfiniteMenu.tsx` (+ `.css`,
  palette adapted; upstream's accent is purple). Three fixes were made to the
  vendored source: a failed image no longer rejects the whole atlas promise, the
  render loop stops on unmount, and blending is enabled. The atlas also crops a
  centred square per cell rather than squashing non-square images.
- **CreativeProcess** — vertical pinned journey, one full-viewport stage per
  step, crossfading. Mascots at ~58vh. Poses: sideCloseUp → pointing →
  clapperboard → laptop → thumbsUp. **Do not add a progress rail with stage dots
  down the edge** — built once, explicitly rejected. A horizontal version was
  also built and rejected.
- **CGIExperiences** — 7 cards, shared `hooks/useTilt.ts`. Water Impact, Space
  Ride, Firestorm, Drone Chase are `comingSoon: true` and render greyed out.
- **Booking** — two-step vehicle configurator (`VehicleConfigurator` →
  `VehicleCard` → `ColorCard`), data-driven from `vehicles.ts`.
- **Navigation** — fully transparent, no background/blur/border. Legibility comes
  from a text halo. Any bar background draws an edge across the viewport and it
  lands on the mascot's helmet.
- **Galaxy** — `ui/Galaxy.tsx`, fixed page-wide starfield, opacity driven by the
  Hero. Its mousemove listener is patched to `window` (vendored edit).

## Gotchas that cost real time

1. **Never pass an inline arrow as a prop that lands in a `useEffect` dep array**
   in `ScrollImageSequence`. It re-created the closure each render, tearing down
   and re-downloading all 298 frames mid-scroll. `onReady` is held in a ref.
2. **Never route scroll-derived values through React state.** Same failure mode.
   `galaxyOpacity` is a MotionValue for this reason.
3. **Frames load through a pool, not serially.** Sequential fetches meant
   scrubbing outran the download and the character froze part-way.
4. **Reading back a WebGL canvas** via `drawImage` into a 2D canvas returns empty
   without `preserveDrawingBuffer`. Screenshot the page instead; I wasted a cycle
   concluding the sphere didn't render when it did.
5. **This container blocks `images.unsplash.com`.** The sphere's discs render
   blank in headless tests here. That is not a regression.

## Verification approach

Playwright drives the production build. `playwright-core` installs into the
scratchpad; chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
with `--use-gl=swiftshader --enable-unsafe-swiftshader`. Serve `dist/public` on
:8099. Screenshots time out under software GL with two WebGL contexts — raise the
timeout rather than assuming a hang.

Worth re-creating as a committed check: an **aspect-ratio audit** that walks the
page and compares every image's rendered aspect against its natural aspect. It
caught the six squashed mascots. It currently only exists in a scratchpad.

## Open items

- **Rotate the GitHub PAT.** It was pasted in the previous session's chat and used
  for every push. Treat it as compromised. Better still, get push working through
  the session's own git proxy — it returned 403 the whole session, and the
  provisioned `GITHUB_TOKEN` is API-scoped only, so pushes went direct with the PAT.
- **Sphere discs are stock photography** (Unsplash) via `data/projects.ts`, not
  real renders. Most visible gap now that the section is full-viewport.
- **Vehicle colour images are placeholders** — every colour reuses the vehicle's
  cover photo. `VehicleColor.image` is ready for real per-colour shots.
- **No form endpoint.** `lib/formHandler.ts` no-ops unless
  `VITE_BOOKING_FORM_ENDPOINT` is set. `FORMSPREE_SETUP.md` at the repo root is
  **stale** — it references a `BookingSection.tsx` that doesn't exist.
- **Footer Instagram link is `#`.**
- **Leftover scaffolding**: `components/ManusDialog.tsx`, `components/Map.tsx`,
  `client/public/__manus__/debug-collector.js` (25 KB, ships to prod),
  `template.json`, `ideas.md`.
- **Commits show "Unverified" on GitHub.** Container has `commit.gpgsign=true` but
  `user.signingkey` points at a 0-byte `.pub` with no private key. The author
  email is already correct. Nothing to fix in the repo; don't rebase over it.
- **No PR opened.** Branch is pushed but unmerged.
