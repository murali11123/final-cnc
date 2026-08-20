import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';

const Hero = () => {
  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 bg-white overflow-hidden">
      {/* Parallax Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#1e40af_1px,transparent_1px),linear-gradient(to_bottom,#1e40af_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copywriting */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-brand-light text-brand-primary text-xs tracking-widest font-extrabold uppercase py-1.5 px-4 rounded-full mb-6 border border-brand-primary/10">
              3D CNC DESIGN LAB
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark leading-tight tracking-tight mb-6"
          >
            HIGH QUALITY CNC <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              2D & 3D FILES
            </span> <br />
            MANUFACTURING
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-500 font-medium mb-4 leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            PRECISION 2D & 3D FILES FOR WOOD, MDF & ACRYLIC
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold tracking-wide text-brand-primary mb-8"
          >
            YOU IMAGINE IT, WE MADE IT.
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={() => handleScroll('categories')}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-brand-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 group"
            >
              <span>EXPLORE DESIGNS</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => handleScroll('ai-search')}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-brand-light text-brand-primary font-bold py-3.5 px-8 rounded-xl border-2 border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Upload size={18} />
              <span>UPLOAD YOUR DESIGN</span>
            </button>
          </motion.div>
        </div>

        {/* Right Side: CNC Machine Micro-Animation */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-br from-white to-brand-light/30 border border-brand-light/60 p-6 shadow-2xl blue-glow"
          >
            {/* Visual CNC Coordinates Grid */}
            <svg viewBox="0 0 400 400" className="w-full h-full text-slate-300">
              {/* Outer boundary */}
              <rect x="20" y="20" width="360" height="360" rx="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Internal axis grid lines */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.5" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="0.5" />
              
              {/* Target Carving Geometry (3D Cube wireframe) */}
              <g className="text-brand-secondary/40 stroke-current" strokeWidth="1.5" fill="none">
                {/* Cube Back face */}
                <rect x="120" y="100" width="120" height="120" rx="4" />
                {/* Cube Front face */}
                <rect x="160" y="140" width="120" height="120" rx="4" className="stroke-brand-primary/50" strokeWidth="2" />
                {/* Connecting corners */}
                <line x1="120" y1="100" x2="160" y2="140" />
                <line x1="240" y1="100" x2="280" y2="140" />
                <line x1="120" y1="220" x2="160" y2="260" />
                <line x1="240" y1="220" x2="280" y2="260" />
              </g>

              {/* Tool carving line paths (glowing blue laser trace) */}
              <motion.path
                d="M 120 100 L 160 140 L 280 140 L 240 100 Z M 160 260 L 280 260 L 280 140"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              />

              {/* Animated CNC Carver Head Tool */}
              <motion.g
                animate={{
                  x: [120, 160, 280, 240, 120, 160, 280, 280, 160],
                  y: [100, 140, 140, 100, 100, 260, 260, 140, 260]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              >
                {/* Router spindle arm */}
                <line x1="0" y1="0" x2="0" y2="-40" stroke="#1e40af" strokeWidth="3" />
                {/* Laser focal ring */}
                <circle cx="0" cy="0" r="10" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                {/* Laser center pointer */}
                <circle cx="0" cy="0" r="3" fill="#3b82f6" />
                {/* Flare pulse */}
                <circle cx="0" cy="0" r="15" fill="none" stroke="#60a5fa" strokeWidth="1" className="animate-ping opacity-60" />
              </motion.g>
            </svg>

            {/* Glowing coordinate displays */}
            <div className="absolute bottom-6 left-6 font-mono text-[10px] text-brand-primary bg-brand-light/80 px-2.5 py-1.5 rounded border border-brand-primary/10 select-none">
              CNC ROUTER ACTIVE | WORK_X: 140.23 | WORK_Y: 260.00
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
