/**
 * Every text input and textarea on the booking form.
 *
 * One constant rather than a copy per field, and now one constant rather than a
 * copy per layout — an underline that is 20% white on the desktop and 30% on the
 * phone is the kind of difference nobody notices until the two are seen side by
 * side, at which point it reads as carelessness.
 *
 * 16px on the type and not a step down, because anything smaller makes iOS zoom
 * the viewport on focus — it scales the whole page to the field and leaves it
 * there. That is a phone constraint that the desktop is happy to live with.
 */
export const fieldClass =
  "bg-transparent border-b border-white/20 focus:border-white/60 outline-none py-3 text-[#F5F7FA] text-base normal-case tracking-normal transition-colors";
