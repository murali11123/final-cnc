import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  const handleNavClick = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = () => {
    const el = document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
                <circle cx="12" cy="12" r="1.5" className="fill-brand-secondary stroke-none" />
              </svg>
              <span className="font-extrabold text-xl tracking-tight text-white">
                3D<span className="text-brand-secondary ml-1">CNC</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-slate-400">
              High-quality CNC 2D & 3D files manufacturing. Precision design templates for wood carving, MDF partitions, acrylic setups, and custom CNC carving works.
            </p>
            <div className="text-white font-bold text-sm tracking-wider uppercase">
              YOU IMAGINE IT, WE MADE IT.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-brand-secondary">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition-colors duration-200">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('ai-search')} className="hover:text-white transition-colors duration-200">
                  AI Design Search
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('categories')} className="hover:text-white transition-colors duration-200">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('branches')} className="hover:text-white transition-colors duration-200">
                  Our Branches
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors duration-200">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('contact')} className="hover:text-white transition-colors duration-200">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-brand-secondary">
              CNC Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={handleCategoryClick} className="hover:text-white transition-colors duration-200">
                  2D Wall Panels
                </button>
              </li>
              <li>
                <button onClick={handleCategoryClick} className="hover:text-white transition-colors duration-200">
                  Temple Designs
                </button>
              </li>
              <li>
                <button onClick={handleCategoryClick} className="hover:text-white transition-colors duration-200">
                  Custom CNC Art
                </button>
              </li>
              <li>
                <button onClick={handleCategoryClick} className="hover:text-white transition-colors duration-200">
                  Wooden Crafts
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-brand-secondary">
              Contact Info
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-brand-secondary shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">9652422988</div>
                  <div className="text-slate-500 text-xs">Call / Contact support</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">7095988918</div>
                  <div className="text-slate-500 text-xs">WhatsApp inquiry</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-brand-secondary shrink-0 mt-0.5" />
                <span className="leading-tight">
                  Sri Satish CNC, Anaparthi / G Mamidada, East Godavari, AP, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} 3D CNC. All Rights Reserved.
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600">You Imagine It, We Made It.</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 hover:text-white cursor-pointer" onClick={() => window.open('/admin/login', '_blank')}>Admin Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
