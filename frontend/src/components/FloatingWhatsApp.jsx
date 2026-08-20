import React from 'react';

const FloatingWhatsApp = () => {
  const whatsappUrl = `https://wa.me/917095988918?text=${encodeURIComponent("Hello! I am browsing the 3D CNC website and would like to ask some questions.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1 group"
      aria-label="Contact on WhatsApp"
    >
      {/* Outer pulsing ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25 group-hover:animate-none"></span>
      
      {/* SVG WhatsApp Logo */}
      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.233-1.371a9.994 9.994 0 004.773 1.21h.005c5.505 0 9.989-4.478 9.99-9.986 0-2.67-1.037-5.178-2.92-7.062C17.18 3.037 14.675 2 12.012 2zm5.727 14.157c-.244.685-1.201 1.248-1.656 1.293-.414.04-1.258.15-2.97-.53-1.702-.677-3.13-2.42-3.92-3.48-.074-.1-.58-.772-.58-1.47 0-.7.367-1.042.496-1.176.13-.133.287-.2.43-.2.143 0 .287.001.408.006.128.005.3.003.468.4.173.41.593 1.442.645 1.547.052.106.088.23.017.373-.07.143-.105.23-.21.353-.105.123-.22.274-.315.372-.105.105-.215.22-.093.43.122.21.543.896 1.161 1.447.797.712 1.467.933 1.675 1.039.21.106.33.09.453-.053.123-.143.525-.615.666-.823.14-.21.282-.176.47-.106.188.07 1.196.564 1.402.668.207.104.343.155.394.244.053.088.053.518-.19.12z" />
      </svg>

      {/* Tooltip on hover */}
      <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with Us
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
