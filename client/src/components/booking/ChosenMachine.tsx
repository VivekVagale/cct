import { SelectionBeam } from "@/components/SelectionBeam";
import { PendingRender } from "@/components/PendingRender";
import {
  OTHER_MACHINE_EYEBROW,
  OTHER_MACHINE_NAME,
} from "@/components/VehicleConfigurator";
import type { Vehicle, VehicleColor } from "@/data/vehicles";

/**
 * What the visitor picked in step 01, repeated where they fill the form in.
 *
 * The configurator is a long way up the page by the time anyone reaches Full
 * Name, and its selection is only visible as a glow on a card that has since
 * scrolled off. Without this the form asks for a name, an email and a
 * description of a machine it never names — and a client who picked the wrong
 * colour has no way to find that out before the request is sent.
 *
 * It states what is missing as plainly as what is chosen. A vehicle with no
 * colour yet is a half-made decision, and saying so here is cheaper than a
 * validation error after the submit.
 *
 * On the phone it is doing more work than it was, because the step that named
 * the machine is not on screen at all any more — it is a screen back. Same
 * component either way.
 */
export function ChosenMachine({
  vehicle,
  color,
  other,
  /**
   * Where "step 01" is, for the reader who has not picked one.
   *
   * The desktop points at an anchor, because step 01 is up the same page. The
   * phone has no anchor to point at — the grid is a screen of its own behind a
   * Back button — so it takes a handler and the wizard walks them there.
   */
  onGoToMachines,
}: {
  vehicle?: Vehicle;
  color?: VehicleColor;
  other?: boolean;
  onGoToMachines?: () => void;
}) {
  /* Ahead of the missing-vehicle branch, because Other is a choice that was
     made and not one that is absent. The paragraph below would send this
     visitor back to step 01 to redo the thing they just did. */
  if (other) {
    return (
      /* Beamed like everything else marked chosen. Nothing lifts under the
         pointer anywhere any more, so this needs no special case. */
      <SelectionBeam selected className="block">
        <div className="selected-glow flex items-center gap-4 rounded-sm border bg-[#7A44E0]/[0.07] p-3 sm:p-4">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-24">
            <PendingRender swatch="#6E7378" label="No render" />
          </div>
          <div className="min-w-0 normal-case tracking-normal">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]">
              {OTHER_MACHINE_EYEBROW}
            </p>
            <p className="font-display text-base sm:text-lg text-[#F5F7FA]">
              {OTHER_MACHINE_NAME}
            </p>
            {/* Where the colour line sits on every other machine. There is no
              colour to choose and no card to tap, so "tap the card above to
              pick one" would point at a control this visitor does not have.
              This says what they owe us instead. */}
            <p className="mt-1 text-xs text-[#B8C4D6]">
              Tell us the make, model and year in step 04 below.
            </p>
          </div>
        </div>
      </SelectionBeam>
    );
  }

  if (!vehicle) {
    /* One sentence, two ways back to the grid. The anchor is right on a page
       where step 01 is above this one; the button is right where it is a screen
       away. Whichever is given, it is padded to a real target — inline in a
       sentence it would inherit the line's height. */
    const linkClass =
      "inline-block py-1.5 -my-1.5 text-[#F5F7FA] border-b border-white/30 transition-colors duration-300 hover:border-white";

    return (
      <p className="text-sm text-[#B8C4D6] normal-case tracking-normal">
        No machine picked yet.{" "}
        {onGoToMachines ? (
          <button type="button" onClick={onGoToMachines} className={linkClass}>
            Go back to step 01.
          </button>
        ) : (
          <a href="#booking" className={linkClass}>
            Step 01 is at the top of this section.
          </a>
        )}{" "}
        The form needs one before it can be sent.
      </p>
    );
  }

  return (
    /* Same, and for the same reason — see the note in the branch above. */
    <SelectionBeam selected className="block">
      <div className="selected-glow flex items-center gap-4 rounded-sm border bg-[#7A44E0]/[0.07] p-3 sm:p-4">
        {/* 80px wide, so the full "Render in progress" cannot sit on one line and
          wraps to three. The echo is captioned by the marque, the model and the
          colour name immediately beside it — this only has to say which of the
          two kinds of thing the picture is. */}
        {(color?.pending ?? vehicle.pending) ? (
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-24">
            <PendingRender
              swatch={color?.swatch ?? vehicle.colors[0]?.swatch ?? "#6E7378"}
              label="No render"
            />
          </div>
        ) : (
          <img
            src={color?.image ?? vehicle.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-14 w-20 shrink-0 rounded-sm object-cover sm:h-16 sm:w-24"
          />
        )}
        <div className="min-w-0 normal-case tracking-normal">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6]">
            {vehicle.manufacturer}
          </p>
          <p className="font-display text-base sm:text-lg text-[#F5F7FA]">
            {vehicle.name}
          </p>
          {color ? (
            <p className="mt-1 flex items-center gap-2 text-xs text-[#B8C4D6]">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: color.swatch }}
              />
              {color.name}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#B8C4D6]">
              No colour chosen — tap the card above to pick one.
            </p>
          )}
        </div>
      </div>
    </SelectionBeam>
  );
}
