/**
 * What a machine or a colourway shows before its render exists.
 *
 * The configurator's whole surface is photographs, so the temptation with a
 * range that has none yet is to borrow one — a neighbouring colour's shot, a
 * manufacturer's press photo, a generated picture of something that looks like
 * the machine. All three tell a client they are looking at the studio's work on
 * their build when they are not, and the first of them has already put five
 * colours under the wrong render once.
 *
 * So this does not pretend to be a photograph. It is the colour itself, lit
 * from the top of the frame the way every render on this page is lit, and a
 * line saying what is missing. `VehicleColor.pending` has documented this
 * intent since before there was anything to show it with: a colourway with no
 * render is still offered, because a client picking one is telling the studio
 * what they want, and it is the configurator's job to say which of the two
 * kinds of thing they are looking at rather than to let them look alike.
 *
 * The badge is the shape and the wording the project cards already use for
 * Coming Soon, in the muted grey rather than the brand violet. It says
 * something different, though, and the difference matters: Coming Soon is a
 * build that cannot be ordered. This one can be — there is simply no shot of it
 * yet.
 */
export function PendingRender({
  swatch,
  label = "Render in progress",
}: {
  swatch: string;
  /** Overridden where the box is too small for the default to fit. */
  label?: string;
}) {
  return (
    <div
      aria-hidden
      className="relative h-full w-full bg-[#0B0E13]"
      /* The paint, at the strength a swatch can carry a whole panel without
         reading as a solid colour swatch blown up — which is what it is, and
         what it should not look like. Two stops rather than one so the frame
         has a direction to it. */
      style={{
        backgroundImage: `radial-gradient(120% 90% at 50% 0%, ${swatch}38 0%, ${swatch}12 45%, transparent 78%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <span className="border border-white/15 px-2 py-1 text-center text-[9px] uppercase tracking-[0.18em] text-[#B8C4D6]/70 sm:px-2.5 sm:text-[10px]">
          {label}
        </span>
      </div>
    </div>
  );
}
