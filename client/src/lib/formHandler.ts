export interface BookingFormData {
  fullName: string;
  email: string;
  instagram: string;
  projectType: string;
  vehicle: string;
  description: string;
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.ok;
}
