/**
 * Whether a machine card flies from the grid to centre stage when it is chosen.
 *
 * Off, and this is the marque lag.
 *
 * The flight is framer's shared layout: the grid card and the panel card carry
 * the same `layoutId`, and framer animates between the two boxes. The cost is
 * that projection measures every node carrying a `layoutId` on each commit, and
 * the grid hands it seventy-one of them — so changing the filter paid for
 * seventy-one measurements before React had finished.
 *
 * Measured on the same clicks, with everything else identical:
 *
 *   ALL to Aprilia   140ms  ->  33ms
 *   ALL to Honda     127ms  ->  31ms
 *
 * Four times quicker on the case that prompted this. Going the other way, Bajaj
 * to ALL, is unchanged at about 150ms — that is forty-four cards being created,
 * which projection was never responsible for.
 *
 * What is lost: the card no longer travels to the panel, it fades up in place.
 * That is already what a phone gets, and what anyone with reduced motion gets,
 * and VehicleFocus's own note calls it "both what a phone sheet should do and
 * free".
 *
 * `true` restores it. Both halves read this one flag, which is the point —
 * VehicleFocus warns that the pair has to go together or framer holds a
 * measurement open for a partner that never arrives.
 */
export const CARD_FLIGHT = false;
