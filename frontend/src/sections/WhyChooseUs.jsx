import React from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Brush, Zap, ShieldCheck, HeartHandshake } from 'lucide-react';

const WhyChooseUs = () => {
  const cards = [
    {
      title: 'High Quality Designs',
      description: 'Fully vetted vector layouts and deep 3D relief meshes optimized to load efficiently and carve clean lines without errors.',
      icon: Award
    },
    {
      title: 'Precision Manufacturing',
      description: 'Carving files engineered exactly to dimensions, preventing wood splitting or acrylic warping on heavy-duty routers.',
      icon: Target
    },
    {
      title: 'Custom Designs',
      description: 'Send us sketches, pictures, or sizing templates. We compile custom vectors or relief models to fit your precise spaces.',
      icon: Brush
    },
    {
      title: 'Fast Response',
      description: 'Quick digital delivery of templates. Dedicated support teams reply instantly on WhatsApp to clarify design specs.',
      icon: Zap
    },
    {
      title: 'Professional Support',
      description: 'We help guide CNC operators, carpenters, or architects on router tooling, post-processors, or scaling issues.',
      icon: ShieldCheck
    },
    {
      title: 'Customer Satisfaction',
      description: 'We adjust design details, resize parameters, or modify carving depths until you get the perfect final product output.',
      icon: HeartHandshake
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-primary font-bold text-xs tracking-widest uppercase block mb-3">
            Our Advantages
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            WHY CHOOSE US
          </h2>
          <p className="text-slate-500 font-medium">
            Discover why carpenters, operators, and interior designers rely on 3D CNC for production-ready architectural design templates.
          </p>
        </div>

        {/* Advantage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white border border-slate-200 hover:border-brand-primary/20 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start hover:-translate-y-1 select-none"
              >
                {/* Icon box */}
                <div className="p-3 bg-brand-light text-brand-primary rounded-2xl mb-5">
                  <IconComp size={22} />
                </div>

                <h3 className="text-base font-bold text-brand-dark mb-2">
                  {card.title}
                </h3>
                
                <p className="text-slate-500 text-xs leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
