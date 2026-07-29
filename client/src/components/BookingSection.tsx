import { useState, type ChangeEvent, type FormEvent } from 'react';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { StaticButton } from '@/components/ui/StaticButton';
import { vehicles } from '@/data/vehicles';
import { submitBookingForm, type BookingFormData } from '@/lib/formHandler';

const PROJECT_TYPES = ['Bike Free Falling', 'Jet Shot', 'Custom Project'];

const initialFormData: BookingFormData = {
  fullName: '',
  email: '',
  instagram: '',
  projectType: PROJECT_TYPES[0],
  vehicle: '',
  description: '',
};

const inputClasses =
  'w-full px-4 py-3 bg-[#0D1117] border border-white/[0.08] rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#FFFFFF]/50';

const labelClasses = 'block text-sm font-medium text-[#B8C4D6] mb-2';

export function BookingSection() {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    const ok = await submitBookingForm(formData);

    setStatus(ok ? 'success' : 'error');
    setIsSubmitting(false);
    if (ok) setFormData(initialFormData);
  };

  return (
    <section id="contact" className="w-full py-24 lg:py-32 bg-[#05070A]">
      <div className="max-w-2xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <span className="text-xs font-medium tracking-[0.2em] text-[#B8C4D6] mb-4 block">
            GET IN TOUCH
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#F5F7FA] mb-4">Book a Project</h2>
          <p className="text-[#B8C4D6]">Let's create something extraordinary together.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClasses} htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="instagram">Instagram Username</label>
            <input
              id="instagram"
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="@yourinstagram"
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="projectType">Project Type</label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className={inputClasses}
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClasses}>Vehicle Selection</span>
            <div role="radiogroup" aria-label="Vehicle Selection" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  {...v}
                  selected={formData.vehicle === v.id}
                  onSelect={(id) => setFormData((prev) => ({ ...prev, vehicle: id }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClasses} htmlFor="description">Project Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className={`${inputClasses} resize-none`}
              placeholder="Tell us about your project vision..."
            />
          </div>

          {status === 'success' && (
            <div className="p-4 bg-[#FFFFFF]/10 border border-[#FFFFFF]/40 rounded-lg text-[#FFFFFF] text-sm">
              Thank you! We'll be in touch soon.
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-400 text-sm">
              Something went wrong. Please try again.
            </div>
          )}

          <StaticButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Project Inquiry'}
          </StaticButton>
        </form>
      </div>
    </section>
  );
}
