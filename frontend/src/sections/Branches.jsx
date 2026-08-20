import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Navigation } from 'lucide-react';

const Branches = () => {
  const branchData = [
    {
      id: 1,
      name: 'Sri Satish CNC and Wood Carving Works',
      landmark: 'Near Bhaskara Hotel',
      city: 'Anaparthi - 533342',
      district: 'East Godavari, Andhra Pradesh',
      phone: '9652422988',
      whatsapp: '7095988918',
      directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Sri+Satish+CNC+and+Wood+Carving+Works+Anaparthi',
      color: 'border-l-4 border-brand-primary'
    },
    {
      id: 2,
      name: 'DRK College Branch',
      landmark: 'Near DRK College of Physical Education',
      city: 'G Mamidada',
      district: 'East Godavari, Andhra Pradesh',
      phone: '9652422988',
      whatsapp: '7095988918',
      directionsUrl: 'https://www.google.com/maps/search/?api=1&query=DRK+College+of+Physical+Education+G+Mamidada+East+Godavari',
      color: 'border-l-4 border-brand-secondary'
    }
  ];

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone, name) => {
    const text = `Hello Sri Satish CNC, I'm contacting your branch regarding your design/carving services.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="branches" className="py-20 bg-slate-50 border-t border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-primary font-bold text-xs tracking-widest uppercase block mb-3">
            Our Locations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            VISIT OUR BRANCHES
          </h2>
          <p className="text-slate-500 font-medium">
            Walk into our state-of-the-art CNC carving workshops located in East Godavari. Discuss your design visions in person with our engineering experts.
          </p>
        </div>

        {/* Branch Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {branchData.map((branch, idx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`bg-white rounded-3xl p-6 lg:p-8 shadow-lg border border-slate-200 flex flex-col justify-between hover:shadow-xl hover:border-brand-secondary/20 transition-all duration-300 ${branch.color}`}
            >
              <div>
                {/* Branch Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Branch {branch.id}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  <span className="text-[10px] text-slate-400 font-bold">Active Workshop</span>
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-brand-dark mb-4">
                  {branch.name}
                </h3>

                {/* Address block */}
                <div className="space-y-3 mb-8 text-sm text-slate-500">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-brand-dark">{branch.landmark}</div>
                      <div>{branch.city}</div>
                      <div>{branch.district}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-brand-primary" />
                    <span>Phone: <strong>{branch.phone}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleCall(branch.phone)}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-brand-light text-slate-700 hover:text-brand-primary font-bold py-2.5 rounded-xl text-xs transition duration-200"
                >
                  <Phone size={12} />
                  <span>Call Now</span>
                </button>
                
                <button
                  onClick={() => handleWhatsApp(branch.whatsapp, branch.name)}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-green-50 text-slate-700 hover:text-green-600 font-bold py-2.5 rounded-xl text-xs transition duration-200"
                >
                  <MessageCircle size={12} className="group-hover:fill-green-600" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={branch.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-xl text-xs transition duration-200 text-center"
                >
                  <Navigation size={12} />
                  <span>Directions</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Branches;
