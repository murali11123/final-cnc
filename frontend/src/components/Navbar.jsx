import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Watch window scroll to apply glassmorphism and update active section spy
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scroll Spy for section highlight
      if (location.pathname === '/') {
        const sections = ['home', 'ai-search', 'categories', 'branches', 'about', 'contact'];
        const scrollPosition = window.scrollY + 120; // offset navbar height

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    }
  };

  // Handle redirects from other pages back to homepage sections
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        // Clear state
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location, navigate]);

  const whatsappUrl = `https://wa.me/917095988918?text=${encodeURIComponent("Hello 3D CNC, I'm interested in your 2D & 3D files manufacturing services.")}`;

  // SVG Brand Logo
  const Logo = () => (
    <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => handleNavClick('home')}>
      <svg className="w-9 h-9 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* CNC Outer Frame / Box */}
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" className="stroke-brand-primary animate-pulse-slow" />
        {/* 3D Inner Cube Face */}
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" className="stroke-brand-secondary" />
        <line x1="12" y1="22.08" x2="12" y2="12" className="stroke-brand-secondary" />
        {/* Drill bit / Tool carving dot */}
        <circle cx="12" cy="12" r="1.5" className="fill-brand-primary stroke-none" />
        <line x1="12" y1="7" x2="12" y2="10.5" className="stroke-brand-primary" strokeWidth="1.5" />
      </svg>
      <span className="font-extrabold text-xl tracking-tight text-brand-dark flex items-center">
        3D<span className="text-brand-primary ml-1">CNC</span>
      </span>
    </div>
  );

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'ai-search', label: 'AI Design Search' },
    { id: 'categories', label: 'Categories' },
    { id: 'branches', label: 'Our Branches' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-nav py-3 border-b border-brand-light shadow-md' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`font-semibold text-sm tracking-wide transition-colors relative py-1 duration-200 ${
                    activeSection === link.id && location.pathname === '/'
                      ? 'text-brand-primary'
                      : 'text-slate-600 hover:text-brand-primary'
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && location.pathname === '/' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full transition-all duration-200" />
                  )}
                </button>
              ))}
            </div>

            {/* WhatsApp Button */}
            <div className="hidden md:flex items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-brand-glow/40 transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
              >
                <Phone size={16} className="fill-white stroke-none" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-700 hover:text-brand-primary p-2 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl z-40 animate-fade-in">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-stretch">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    activeSection === link.id && location.pathname === '/'
                      ? 'bg-brand-light text-brand-primary'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-2 border-slate-200" />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-xl shadow-md w-full transition-all text-center"
              >
                <Phone size={18} className="fill-white stroke-none" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
