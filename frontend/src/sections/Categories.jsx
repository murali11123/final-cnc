import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Landmark, Cpu, Sparkles, ArrowRight } from 'lucide-react';

const Categories = ({ onSelectCategory }) => {
  const categoriesList = [
    {
      id: '2D Wall Panels',
      title: '2D Wall Panels',
      description: 'Elegant architectural partitions, decorative screens, and modern wall panels designed for CNC routing on MDF, wood, and acrylic.',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      tagline: 'Decorative Screens & louvers',
      svgPattern: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 text-brand-primary">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )
    },
    {
      id: 'Temple Designs',
      title: 'Temple Designs',
      description: 'Sacred architectural mandir partitions, symmetric pooja room doors, and intricate traditional radial engravings.',
      icon: Landmark,
      color: 'from-cyan-500 to-blue-600',
      tagline: 'Symmetric Pooja Mandirs',
      svgPattern: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 text-brand-primary">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 50 0 L 50 100 M 0 50 L 100 50" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )
    },
    {
      id: 'Custom CNC',
      title: 'Custom CNC',
      description: 'Bespoke CNC design models carved to your specifications. Tailored artistic panels, relief wall art, and complex curved meshes.',
      icon: Cpu,
      color: 'from-blue-600 to-brand-primary',
      tagline: 'Tailored Carving & relief work',
      svgPattern: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 text-brand-primary">
          <path d="M 0 50 Q 25 15, 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 0 30 Q 25 -5, 50 30 T 100 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 0 70 Q 25 35, 50 70 T 100 70" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )
    },
    {
      id: 'Wooden Crafts',
      title: 'Wooden Crafts',
      description: 'Intricate classic lattices, custom frames, personalized gift items, and high-precision wood craft elements.',
      icon: Sparkles,
      color: 'from-indigo-500 to-cyan-600',
      tagline: 'Precision Wood joints & frames',
      svgPattern: (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 text-brand-primary">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="0.5" />
          <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )
    }
  ];

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-primary font-bold text-xs tracking-widest uppercase block mb-3">
            Product Catalog
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            EXPLORE OUR DESIGNS
          </h2>
          <p className="text-slate-500 font-medium">
            Browse our core carving styles tailored for carpentry, interior architecture, industrial CNC routing, and individual decoration projects.
          </p>
        </div>

        {/* Categories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categoriesList.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-200 hover:border-brand-secondary/40 rounded-3xl p-6 lg:p-8 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 select-none blue-glow-hover"
              >
                {/* Visual SVG Pattern Overlay in background */}
                <div className="absolute top-0 right-0 w-44 h-44 z-0 pointer-events-none transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-500">
                  {cat.svgPattern}
                </div>

                <div className="relative z-10">
                  {/* Category Header (Icon + Title) */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3.5 bg-brand-light rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-secondary font-extrabold uppercase tracking-wider block">
                        {cat.tagline}
                      </span>
                      <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-primary transition-colors duration-200">
                        {cat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                    {cat.description}
                  </p>
                </div>

                {/* Explore Trigger */}
                <div className="relative z-10">
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="flex items-center gap-2 text-brand-primary group-hover:text-brand-secondary font-bold text-sm transition-colors duration-200"
                  >
                    <span>Explore Designs</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
