import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Graphic illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-[380px] aspect-square bg-brand-light rounded-3xl border border-brand-primary/10 overflow-hidden p-8 flex items-center justify-center shadow-lg"
            >
              {/* CNC machine laser illustration inside background */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-brand-primary/30">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M 50 15 L 50 85 M 15 50 L 85 50" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 30 30 C 50 20, 50 80, 70 70" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary stroke-current" />
                <circle cx="70" cy="70" r="2" fill="currentColor" />
              </svg>

              {/* Tag overlay */}
              <div className="absolute bottom-6 right-6 font-mono text-[9px] text-slate-500 uppercase tracking-widest bg-white py-1 px-3 rounded-full border border-slate-200 shadow-sm">
                Engineering precision
              </div>
            </motion.div>
          </div>

          {/* Right: Content details */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-brand-primary font-bold text-xs tracking-widest uppercase block mb-3">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-6">
                ABOUT 3D CNC
              </h2>
              
              <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-medium">
                <p>
                  Welcome to <strong>3D CNC</strong>, your trusted destination for premium CNC design solutions. We specialize in high-quality 2D and 3D CNC files for wood, MDF, acrylic and custom carving projects.
                </p>
                <p>
                  From elegant wall panels and temple designs to custom CNC artwork and wooden crafts, we focus on precision, creativity and production-ready designs.
                </p>
                <p>
                  Our goal is to transform your ideas into beautiful CNC-ready designs while maintaining quality and attention to detail.
                </p>
                <p>
                  Whether you are a carpenter, interior designer, furniture manufacturer, CNC operator or individual customer, 3D CNC provides reliable and creative design solutions.
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="text-xl font-bold tracking-wider text-brand-primary italic">
                  "You Imagine It, We Made It."
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
