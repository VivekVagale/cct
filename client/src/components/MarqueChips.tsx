import { motion, useReducedMotion } from "framer-motion";

export interface MarqueChip {
  id: string;
  label: string;
  /** The second line, where the label alone leaves the choice ambiguous. */
  hint?: string;
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
}: {
  name: string;
  options: MarqueChip[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <fieldset className="w-full">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap justify-center gap-2.5">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <motion.label
              key={option.id}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className={`group relative cursor-pointer select-none rounded-full border px-5 py-3 text-left transition-colors duration-300 ${
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
        })}
      </div>
    </fieldset>
  );
}
