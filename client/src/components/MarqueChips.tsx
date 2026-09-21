import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { BEAM_LIT, BEAM_REST } from "./beamMotion";

export interface MarqueChip {
  id: string;
  label: string;
  /** The second line, where the label alone leaves the choice ambiguous. */
  hint?: string;
}

interface ChipLabelProps {
  option: MarqueChip;
  name: string;
  selected: boolean;
  onChange: (id: string) => void;
  reduceMotion: boolean | null;
  /**
   * Pointer and focus handlers, when a beam is listening for them.
   *
   * On the label rather than on a wrapper inside the beam, and that is not a
   * tidiness point: BorderBeam reads its corner radius off its *first child*, so
   * anything in between is what gets measured. A plain div there reported square
   * corners and the beam drew a 9999px ring around a box it thought was
   * rectangular — two crescents either side of every chip.
   */
  handlers?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * The chip itself, identical whether or not it is wearing a beam.
 *
 * One component rather than one copy per branch: the two differ only in what is
 * wrapped around them, and a chip that drifted between them is a bug nobody sees
 * until the `beam` prop is turned on somewhere new.
 */
function ChipLabel({
  option,
  name,
  selected,
  onChange,
  reduceMotion,
  handlers,
}: ChipLabelProps) {
  return (
    <motion.label
      {...handlers}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      /* `inline-block` matters only inside a beam. In the plain row the label is
         a flex item and the container blockifies it; wrapped in BorderBeam it is
         an ordinary inline box, and an inline box does not take vertical padding
         — the chip collapsed to 54x85 where it should be 122x61. Harmless in the
         flex row, which overrides display anyway. */
      className={`group relative inline-block cursor-pointer select-none rounded-full border px-5 py-3 text-left transition-colors duration-300 ${
        selected
          ? "selected-glow border-transparent bg-[#7A44E0]/[0.10]"
          : "border-white/[0.14] bg-white/[0.02] hover:border-white/30"
      }`}
    >
      {/* The real control. Visually hidden rather than `display: none`,
          which would take it out of the tab order and off the keyboard
          entirely. */}
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={selected}
        onChange={() => onChange(option.id)}
        className="sr-only peer"
      />
      {/* The ring only when the keyboard put focus here, so a pointer
          user never sees two selection treatments at once. */}
      <span className="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#9F6EF2] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#05070A]" />
      <span
        className={`block text-[11px] tracking-[0.16em] uppercase transition-colors duration-300 ${
          selected ? "text-[#F5F7FA]" : "text-[#B8C4D6]"
        }`}
      >
        {option.label}
      </span>
      {option.hint && (
        <span className="mt-1 block text-[10px] normal-case tracking-normal text-[#B8C4D6]/70">
          {option.hint}
        </span>
      )}
    </motion.label>
  );
}

/**
 * A chip that lights under the pointer.
 *
 * Its own component because it holds state, and state cannot be held inside a
 * `map` callback.
 *
 * Invisible at rest rather than unmounted. `strength: 0` hides the beam and
 * `active: false` stops the animation, so an untouched chip costs a wrapper and
 * nothing else — where mounting the beam on hover would change the DOM under the
 * pointer and risk the chip moving as it appeared. Ten of these idling the way
 * the search bar does would be sixty animated layers over the starfield, which
 * is the reason this one waits to be asked.
 *
 * No phase carrying here, unlike the bar and the button. Those change speed
 * while visible, so the jump shows; this one is invisible until the moment it
 * starts, and there is no earlier position to keep.
 *
 * Nothing extra on the selected chip. It already wears `selected-glow`, and a
 * beam on top is one control with two light sources that disagree — the same
 * reason the search bar gave up its ring rather than wearing both. That class is
 * also the point of this component: "chosen" is meant to look identical here and
 * on the vehicle and colour cards, and only one of those can grow a beam.
 */
function BeamChip({
  selected,
  render,
}: {
  selected: boolean;
  render: (h: ChipLabelProps["handlers"]) => ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  /* The lift: quicker and more saturated, for the chip under the pointer. */
  const lit = hovered || focused;
  /*
   * Whether there is a beam at all.
   *
   * The chosen chip keeps one, idling. Without this, clicking a chip lit it —
   * the click focuses the hidden radio — and then clicking anywhere else blurred
   * it and the beam died, while that chip was still the active filter. A beam
   * that appears on selection and then abandons it reads as broken, which is
   * what it was.
   *
   * One chip at a time, so this is not the ten-idling-beams problem that kept
   * the row dark in the first place.
   */
  const shown = lit || selected;

  /*
   * The corner radius, measured rather than detected.
   *
   * BorderBeam reads the radius off its first child when none is given, and the
   * chip's is Tailwind's `rounded-full` — which in v4 is `calc(infinity * 1px)`
   * and computes to 24,403,200px. Handed that, the beam drew its ring at a
   * radius tens of thousands of times the chip's size: two crescents either side
   * of every chip and no pill anywhere.
   *
   * A pill's real radius is half its height, so that is what gets passed. `null`
   * until measured, which keeps the beam hidden for the frame before the number
   * exists rather than showing the artefact and correcting it.
   */
  const ref = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setRadius(h / 2);
    };
    measure();
    /* Chips reflow — the row wraps at narrow widths and the font can settle
       late — and a stale radius would show the artefact again on resize. */
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Handed down to the label rather than applied to a wrapper here. Nothing may
     sit between the beam and the pill — see the note on ChipLabelProps.handlers.
     `onFocus`/`onBlur` are focusin/focusout in React, so the hidden radio inside
     the label is caught without a ref, which is what lights a chip reached by
     keyboard. */
  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  return (
    <BorderBeam
      ref={ref}
      size="md"
      colorVariant="colorful"
      brightness={1.3}
      duration={lit ? BEAM_LIT.duration : BEAM_REST.duration}
      saturation={lit ? BEAM_LIT.saturation : BEAM_REST.saturation}
      /* Nothing to show until the radius is known — see the note above. The
         chosen chip idles at rest strength; the pointer takes it to full. */
      strength={
        radius === null ? 0 : lit ? BEAM_LIT.strength : shown ? BEAM_REST.strength : 0
      }
      active={shown && radius !== null}
      {...(radius !== null ? { borderRadius: radius } : {})}
      className="inline-block"
    >
      {render(handlers)}
    </BorderBeam>
  );
}

/**
 * A row of chips, one of which is chosen.
 *
 * Radios, structurally — one name, one answer, arrow keys between them — drawn
 * as chips because four options across a form are a decision to be glanced at
 * rather than a list to be read down. The native input stays in the markup and
 * carries the value, so the form submits without JavaScript having to collect
 * anything and a screen reader is handed a real radio group rather than a set
 * of divs with click handlers.
 *
 * Selected state is the site's `selected-glow` — the same violet ring and bloom
 * the vehicle and colour cards use. That is the point of putting it in its own
 * component: "chosen" should look identical everywhere on this page, and it did
 * not when each surface drew its own.
 */
export function MarqueChips({
  name,
  options,
  value,
  onChange,
  label,
  beam = false,
}: {
  name: string;
  options: MarqueChip[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /**
   * Light each chip under the pointer.
   *
   * Off by default, and asked for only by the marque filter. The other three
   * users of this component — stickers, OEM and usage — are questions inside a
   * form, where a row that lights as the pointer crosses it reads as something
   * loading rather than something answerable.
   */
  beam?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <fieldset className="w-full">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap justify-center gap-2.5">
        {options.map((option) => {
          const selected = option.id === value;
          /* Built once so the two branches cannot be handed different chips. */
          const chipProps: ChipLabelProps = {
            option,
            name,
            selected,
            onChange,
            reduceMotion,
          };
          return beam ? (
            <BeamChip
              key={option.id}
              selected={selected}
              render={(handlers) => <ChipLabel {...chipProps} handlers={handlers} />}
            />
          ) : (
            <ChipLabel key={option.id} {...chipProps} />
          );
        })}
      </div>
    </fieldset>
  );
}
