import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import AISearch from '../sections/AISearch';
import Categories from '../sections/Categories';
import Gallery from '../sections/Gallery';
import Branches from '../sections/Branches';
import About from '../sections/About';
import WhyChooseUs from '../sections/WhyChooseUs';
import Contact from '../sections/Contact';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [detailDesignId, setDetailDesignId] = useState(null);
  const galleryRef = useRef(null);
  const location = useLocation();

  // Listen for query params on load (e.g. ?designId=XXXX for shared links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const designId = params.get('designId');
    if (designId) {
      // Set design ID to trigger modal opening
      setDetailDesignId(designId);
      
      // Scroll to gallery
      setTimeout(() => {
        const el = document.getElementById('gallery');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    // Scroll to the design gallery section
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDesignDetail = (designId) => {
    setDetailDesignId(designId);
    // Scroll to the design gallery section where modal will overlay
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Single Page Sections */}
      <Hero />
      
      <AISearch onViewDesign={handleViewDesignDetail} />
      
      <Categories onSelectCategory={handleSelectCategory} />
      
      <Gallery
        ref={galleryRef}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        detailDesignId={detailDesignId}
        onClearDetailId={() => setDetailDesignId(null)}
      />
      
      <Branches />
      
      <About />
      
      <WhyChooseUs />
      
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Floating Speed Dial */}
      <FloatingWhatsApp />
    </div>
  );
};

export default Home;
