import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Booking Section
 * 
 * Design Philosophy:
 * - Beautiful glassmorphism form
 * - Premium input styling
 * - Formspree integration for email handling
 * - Elegant form interactions
 */

export function BookingSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    instagram: '',
    bikeCar: '',
    model: '',
    projectType: 'Bike Free Falling',
    description: '',
    budget: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          instagram: '',
          bikeCar: '',
          model: '',
          projectType: 'Bike Free Falling',
          description: '',
          budget: '',
        });
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative w-full py-16 sm:py-24 bg-[#05070A]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold text-[#F5F7FA] mb-4">Book a Project</h2>
          <p className="text-[#B8C4D6] text-lg">Let's create something extraordinary together.</p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="bg-[#0D1117]/60 backdrop-blur-md border border-[#7FDBFF]/20 rounded-2xl p-8 lg:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Instagram Username</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                placeholder="@yourinstagram"
              />
            </div>

            {/* Bike/Car Brand and Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#F5F7FA] font-semibold mb-2">Bike/Car Brand</label>
                <input
                  type="text"
                  name="bikeCar"
                  value={formData.bikeCar}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                  placeholder="Brand"
                />
              </div>
              <div>
                <label className="block text-[#F5F7FA] font-semibold mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                  placeholder="Model"
                />
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Project Type</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
              >
                <option value="Bike Free Falling">Bike Free Falling</option>
                <option value="Jet Shot">Jet Shot</option>
                <option value="Future Custom Project">Future Custom Project</option>
              </select>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Project Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200 resize-none"
                placeholder="Tell us about your project vision..."
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-[#F5F7FA] font-semibold mb-2">Budget (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#05070A]/50 border border-[#7FDBFF]/20 rounded-lg text-[#F5F7FA] placeholder-[#B8C4D6]/50 focus:outline-none focus:border-[#7FDBFF]/50 focus:ring-1 focus:ring-[#7FDBFF]/30 transition-all duration-200"
                placeholder="Budget range"
              />
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <motion.div
                className="p-4 bg-[#7FDBFF]/10 border border-[#7FDBFF]/50 rounded-lg text-[#7FDBFF]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Thank you! We'll be in touch soon.
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div
                className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Something went wrong. Please try again.
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#7FDBFF] text-[#05070A] font-semibold rounded-lg hover:bg-[#5FC8FF] disabled:opacity-50 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Project Inquiry'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
