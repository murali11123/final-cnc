import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { submitContactMessage } from '../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required.');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required.');
      return false;
    }
    // simple phone regex: at least 10 digits
    if (!/^\d{10,13}$/.test(formData.phone.replace(/[\s\-\+]/g, ''))) {
      toast.error('Please enter a valid phone number (at least 10 digits).');
      return false;
    }
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address.');
        return false;
      }
    }
    if (!formData.message.trim()) {
      toast.error('Message is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await submitContactMessage(formData);
      toast.success(response.message || 'Message submitted successfully!');
      
      // Reset form on success
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50 border-t border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-primary font-bold text-xs tracking-widest uppercase block mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            CONTACT OUR TEAM
          </h2>
          <p className="text-slate-500 font-medium">
            Have a custom design inquiry? Need a specific file format or dimension? Submit a request below, and we will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* Left: Contact Info Block */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Reach out to us directly or visit our workshops. We are happy to help with files, pricing, or custom routing setups.
              </p>

              <ul className="space-y-6 text-sm text-slate-300">
                <li className="flex items-start gap-4">
                  <Phone size={18} className="text-brand-secondary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Call / Text Support</div>
                    <div>+91 9652422988</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail size={18} className="text-brand-secondary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Email Address</div>
                    <div>srisatishcnc@gmail.com</div>
                    <div className="text-xs text-slate-500">For custom vector exchanges</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="text-brand-secondary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Main Branch Address</div>
                    <div>Near Bhaskara Hotel, Anaparthi, East Godavari - 533342, AP</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
              OFFICE HOURS: MON - SAT | 9:00 AM - 8:00 PM IST
            </div>
          </div>

          {/* Right: Contact Form Block */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Email Address <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your design specifications (size, category, material depth)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 px-6 rounded-xl shadow hover:shadow-brand-primary/20 transition disabled:bg-slate-350 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                    <span>Submitting message...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
