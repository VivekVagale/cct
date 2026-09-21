# cct website — playbook

**Read the box below and stop. The rest is reference — open a section only when
working in it.** Reading this whole file at the start of a session costs more
context than it returns.

```
pnpm, not npm.                  An npm install leaves a lockfile fighting pnpm's.
Routes lock at first paint.     Resizing never switches desktop <-> phone. Reload.
CARD_FLIGHT = false             ON PURPOSE. On = the 140ms marque lag returns.
TILT_ENABLED = true             Card tilt. Turn off if a weak machine struggles.
Beam = 3 places only.           Search bar, Start a Project, marque chips. No cards.
Phone shell is a fixed document. Only the inner scroller scrolls.
Test pane is often hidden.      rAF and long-task readings are then worthless.
Expected typecheck errors:      Lanyard.tsx(347), const.ts(1). Pre-existing.
```

| If you are touching | Read |
|---|---|
| marque filter, card grid, anything slow | §2 performance flags |
| adding a beam anywhere | §3 the beam |
| the phone wizard, keyboard, scrolling | §4 phone shell |
| the booking form or its validation | §5 forms |
| measuring anything in the browser | §6 testing notes |

---

The code comments explain *why* line by line; the sections below are the map and
the traps that span more than one file.

Stack: React 19, Vite 7, Tailwind 4, framer-motion 12, **pnpm** (not npm — an
`npm install` here leaves a `package-lock.json` fighting `pnpm-lock.yaml`).

---

## 1. Two sites, one bundle

`App.tsx` picks a route **once, at first paint**, and never follows it:

```
(pointer: coarse) and (max-width: 900px)   ->  MobileBooking  (six-step wizard)
everything else                            ->  DesktopSite    (the whole story)
```

`useIsPhoneRoute` caches the answer at module scope on purpose. The two are
different React trees, so following the query across a resize would unmount one
and mount the other, taking every typed field with it. A tablet rotated mid-form
would lose the form.

Consequence for testing: **resizing the window does not switch routes.** Reload.

---

## 2. The performance flags

Two constants turn expensive behaviour on and off. Both are off, both cost
something visual, and both were measured rather than guessed.

| Flag | File | State | What it buys back |
|---|---|---|---|
| `CARD_FLIGHT` | `components/cardFlight.ts` | `false` | The chosen card flying from grid to focus panel |
| `TILT_ENABLED` | `hooks/useTilt.ts` | `true` | 3D cursor tilt on cards |

### CARD_FLIGHT, and the marque lag

Clicking a marque chip cost **140ms** of blocked main thread. The cause was not
React and not the beams:

The grid card and the panel card share a `layoutId` so the card can fly to centre
stage. Framer's layout projection measures **every node carrying a `layoutId` on
each commit**, and the grid hands it seventy-one. Changing the filter paid for
seventy-one measurements before React had finished.

```
ALL -> Aprilia   140ms -> 33ms
ALL -> Honda     127ms -> 31ms
```

Both halves of the pair read the one flag, and they must: `VehicleFocus` warns
that turning off one side alone leaves framer holding a measurement open for a
partner that never arrives.

Cost: the card fades up in the panel instead of travelling to it — already what a
phone and reduced-motion get.

### The other two thirds of that fix

Projection was the biggest piece, not all of it. Two more changes, and **neither
works without the other** — each did nothing when tried alone:

1. **Cards stay mounted.** Filtering sets `hidden` on the cell rather than
   dropping the card. Nothing is created or destroyed to change a marque. The
   full set is mounted at rest anyway, since ALL is the default.
2. **`VehicleCard` is memoised**, and `onSelect` takes an id instead of closing
   over one. The old `() => handleSelectVehicle(vehicle.id)` minted a fresh
   function per card per render, so every card's props differed every time and
   memo skipped nothing.

Alone, keep-mounted made shrinking *worse* (33ms → 91ms) because all 71 cards
then re-rendered. Together: **~30ms in every direction.**

Ruled out along the way, all measured, all still in the 90–155ms band: removing
card beams, removing chip beams, keep-mounted alone, memo alone.

---

## 3. The beam

`border-beam` (npm, real, ~745k downloads/month) marks a chosen control.
`SelectionBeam.tsx` wraps it so "chosen" looks the same everywhere.

**Where it lives, and nowhere else:** the search bar, the Start a Project
buttons, the marque chips. It was stripped from machine cards, colour cards,
build cards and the booking summary — eighty-odd BorderBeams is real weight on a
page already running a starfield and a 298-frame scrub, for something
`selected-glow` already communicated.

Three things it will bite you with:

- **Nothing may sit between BorderBeam and the element whose shape it follows.**
  It reads its corner radius off its *first child*. A wrapper div in between gets
  measured instead.
- **`rounded-full` is not a number it can use.** Tailwind v4 resolves it to
  `calc(infinity * 1px)` = 24,403,200px, and the beam drew two crescents either
  side of every chip. `SelectionBeam` measures `offsetHeight` and clamps the
  radius to half of it — one rule that fits a pill and a `rounded-sm` card both.
- **It does not spread unrecognised props onto its root.** Handlers passed to it
  never fire. Attach through the ref, or put them on the child.

Also: it pauses itself when off-screen. Don't conclude it's broken from an
element you've scrolled past — that cost a wrong diagnosis.

Speed and colour live in `beamMotion.ts`, in one place because two copies drifted
twice. `BEAM_REST_STRONG` exists for the chips: a beam's light is spread along a
perimeter, so the default all but disappears on a 95×42 pill.

---

## 4. The phone shell

`useAppShellViewport` does two jobs, both because most phone traffic arrives
through Instagram's in-app WKWebView rather than Safari.

1. **Holds the document still** — `position: fixed` on the body, because
   `overscroll-behavior` is only honoured by recent WebKit and an in-app browser
   is whatever WebKit the host app shipped with.
2. **Reports what is visible** — the shell is sized to `visualViewport.height`
   and translated by `visualViewport.offsetTop`.

That second half matters and both parts are load-bearing. iOS does not resize the
layout viewport for the keyboard — it covers it, *and scrolls it* so the focused
field clears the keys. Height alone put the footer above the keyboard but left a
black band under it, because a fixed shell is pinned to the layout viewport and
does not move with the visual one.

**A fixed document means only the inner scroller scrolls.** Anything that takes a
row of the shell is a strip of screen where swiping does nothing. The footer used
to be such a row; it is now out of the flow, transparent, `pointer-events: none`,
with only the button taking its events back, and the scroller runs the full
height beneath it.

Forwarding those touches to the scroller by hand was tried first and was worse —
a drag applied frame by frame cannot match a native scroll running directly above
it. Don't retry it.

**Still a dead zone:** the top ~159px — header, step text, pinned search. Same
technique would work, but forwarding drags off a text input fights caret and
selection.

---

## 5. Forms

`MarqueChips` is one component used four times: the marque filter, Free Fall's
stickers and OEM questions, and the usage step. Only the marque row passes
`beam`.

The wizard keeps **all six steps mounted**, hidden with the `hidden` attribute.
`FormData` collects the whole form on submit, and the fields are uncontrolled, so
unmounting a step would silently drop its answers and lose what was typed.

That has a consequence worth knowing: the form carries `noValidate` and runs
native validation **per step** inside `stepValid()`, because `required` on a
field in a hidden step blocks submit with an error the browser cannot show
("An invalid form control is not focusable"). Step 06 is the last step and has no
Next, so `submitIfLast` has to call `stepValid()` itself — without that call
every `required` on the contact step is inert and a request can be sent with no
name, no email and no handle.

---

## 6. Testing notes

The browser pane used for checking is frequently **hidden**, and that invalidates
whole classes of measurement:

- `requestAnimationFrame` never fires, so framer exits never resolve and
  `AnimatePresence` never unmounts. Panels appear stuck. They are not.
- Long-task observers miss work. A "0ms, fixed" reading was wrong for exactly
  this reason; synchronous timing inside the click handler is trustworthy where
  `PerformanceObserver` is not.
- Screenshots time out. `read_page`, `find` and DOM measurement still work.

Measure the click synchronously:

```js
const t0 = performance.now();
chip.querySelector('input').click();
const syncMs = performance.now() - t0;   // React commits during dispatch
```

Two pre-existing typecheck errors are unrelated to anything here and are expected
on a clean tree: `Lanyard.tsx(347)` and `const.ts(1)`.

---

## 7. Open

- Grid cards render without images at phone width for several machines. Noticed,
  not investigated, not caused by any change here.
- `82bbeaf` (keyboard offsetTop) is reasoned from the `visualViewport` API, not
  measured — no keyboard can be opened in the test pane. Needs one check on a
  real phone.
- The header's dead scroll zone, above.
