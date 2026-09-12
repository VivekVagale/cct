import type { BookingStep } from "@/data/bookingSteps";

/**
 * The numbered heading above each part of the request.
 *
 * The section asks for six separate things across two layouts — a vehicle grid,
 * a card grid, a price, a column of fields, a row of chips — and without a
 * running count there is nothing telling a visitor how much is left, or that the
 * machine they picked at the top belongs to the form at the bottom at all.
 *
 * It was local to the desktop Booking section. It is here now because the phone
 * prints the same numbers, and two copies of a component whose entire job is to
 * say "Step 02" is two places for Step 02 to become something else.
 *
 * `of` prints the total beside the number. The phone shows one step at a time
 * and needs it — "Step 02" alone on a screen says nothing about how much is
 * left. The desktop has all six visible and does not.
 */
export function Step({
  step,
  hint,
  of,
  className,
}: {
  step: BookingStep;
  /** Overrides the step's own hint, for the steps that compute theirs. */
  hint?: string;
  of?: number;
  className?: string;
}) {
  const line = hint ?? step.hint;

  return (
    <div className={`mb-5 sm:mb-6 ${className ?? ""}`}>
      <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-2">
        Step {step.number}
        {of ? ` of ${String(of).padStart(2, "0")}` : ""}
      </p>
      <h3 className="font-display text-xl sm:text-2xl text-[#F5F7FA] leading-tight">
        {step.title}
      </h3>
      {line && <p className="text-sm text-[#B8C4D6] mt-2 max-w-md">{line}</p>}
    </div>
  );
}
