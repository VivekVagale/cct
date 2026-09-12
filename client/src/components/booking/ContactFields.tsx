import { fieldClass } from "./fieldClass";

/**
 * Name, email and the two handles.
 *
 * One field per row rather than two across. A single column gives every field
 * the same left edge and one reading order, which is what makes a form
 * scannable — and the pairs it replaces put Email beside Full Name at desktop
 * width and stacked them anyway on a phone, so the two-column version was only
 * ever the desktop's layout.
 *
 * Capped rather than run to the column's full width: an underline five hundred
 * pixels long reads as a rule across the page, not as a field. The phone is
 * narrower than the cap and simply never reaches it.
 *
 * Uncontrolled, and collected by FormData at submit like every other field
 * here. That matters more on the phone than it looks: the wizard hides the
 * steps it is not on rather than unmounting them, so what has been typed
 * survives going back and forward, and the submit still sees all four.
 */
export function ContactFields() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-xl">
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
        Full Name
        <input name="fullName" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
        Email
        <input name="email" type="email" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
        Your Instagram @handle
        <input
          name="instagram"
          placeholder="@yourhandle"
          className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
        />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">
        WhatsApp @handle/number (optional)
        <input
          name="whatsapp"
          placeholder="+91 98765 43210"
          className={`${fieldClass} placeholder:text-[#B8C4D6]/40`}
        />
      </label>
    </div>
  );
}
