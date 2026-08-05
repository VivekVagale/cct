export interface BookingFormData {
  fullName: string;
  email: string;
  instagram: string;
  /** Optional — a handle or a number, whichever the client gave. */
  whatsapp: string;
  projectType: string;
  vehicle: string;
  description: string;
  /**
   * Whether the client wants the reel posted as an Instagram collab, which
   * puts it in both accounts' feeds at once. Sent on every submission,
   * including the ones that say no — "they did not ask for it" and "they were
   * never asked" are different things to read in an inbox.
   */
  collabPost: boolean;
}

/**
 * Isolated submission logic. Swap the implementation here — a form
 * relay today, a custom booking/option-selection/traffic-management
 * backend later — without touching the form component.
 *
 * TODO: point this at the real endpoint once it's decided.
 */
export async function submitBookingForm(data: BookingFormData): Promise<boolean> {
  const endpoint = import.meta.env.VITE_BOOKING_FORM_ENDPOINT;

  if (!endpoint) {
    console.warn('VITE_BOOKING_FORM_ENDPOINT is not set — form submission is not wired up yet.');
    return false;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    // Accept matters as much as Content-Type. Formspree answers a JSON POST
    // with a 302 to its own thank-you page unless the request asks for JSON,
    // and a followed redirect resolves to an ok response for a page this code
    // never wanted — so a failed submission could read as a successful one.
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.ok;
}
