import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpDown, MessageCircle, Eye, Heart, Share2, X, AlertCircle } from 'lucide-react';
import { fetchDesigns } from '../services/api';
import toast from 'react-hot-toast';

const Gallery = forwardRef(({ selectedCategory, onCategoryChange, detailDesignId, onClearDetailId }, ref) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(8);
  const [favorites, setFavorites] = useState([]);
  
  // Modal detail view state
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expose function to open modal from parent (for AI Search matches)
  useImperativeHandle(ref, () => ({
    openDesignModalById: async (id) => {
      await loadAndOpenDesign(id);
    }
  }));

  // Fetch designs on filters/search/sort change
  useEffect(() => {
    const loadDesigns = async () => {
      setLoading(true);
      try {
        const data = await fetchDesigns({
          category: selectedCategory === 'All' ? '' : selectedCategory,
          search: searchQuery,
          sort: sortOption
        });
        setDesigns(data);
        setVisibleCount(8); // Reset pagination
      } catch (error) {
        console.error('Failed to load designs:', error);
        toast.error('Error fetching designs. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce API calls slightly for search query
    const timeoutId = setTimeout(loadDesigns, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, sortOption]);

  // Handle opening design from parent trigger ID (e.g. AI Search view click)
  useEffect(() => {
    if (detailDesignId) {
      loadAndOpenDesign(detailDesignId);
    }
  }, [detailDesignId]);

  const loadAndOpenDesign = async (id) => {
    try {
      const designToOpen = designs.find(d => d._id === id);
      if (designToOpen) {
        setSelectedDesign(designToOpen);
        setIsModalOpen(true);
      } else {
        // Fetch from API in case it's not in the current list
        const response = await fetchDesigns();
        const found = response.find(d => d._id === id);
        if (found) {
          setSelectedDesign(found);
          setIsModalOpen(true);
        } else {
          toast.error('Could not find the requested design details.');
        }
      }
    } catch (err) {
      toast.error('Failed to load design details.');
    } finally {
      if (onClearDetailId) onClearDetailId();
    }
  };

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites_cnc');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  const toggleFavorite = (designId, e) => {
    e.stopPropagation();
    let updatedFavs;
    if (favorites.includes(designId)) {
      updatedFavs = favorites.filter(id => id !== designId);
      toast.success('Removed from Favorites');
    } else {
      updatedFavs = [...favorites, designId];
      toast.success('Added to Favorites');
    }
    setFavorites(updatedFavs);
    localStorage.setItem('favorites_cnc', JSON.stringify(updatedFavs));
  };

  const shareDesign = (design, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?designId=${design._id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Sharing not supported on this browser.');
    }
  };

  const handleWhatsAppOrder = (design) => {
    const text = `Hello,
I am interested in this CNC design.
Design Name: ${design.name}
Design Code: ${design.code}
Category: ${design.category}
Please provide more details.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/917095988918?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedDesign(null);
  };

  const categories = ['All', '2D Wall Panels', 'Temple Designs', 'Custom CNC', 'Wooden Crafts'];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Controls (Search, Filter, Sort) */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-12 shadow-sm flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search bar */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search designs by name, code (e.g. WP001), or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Filters and Sort actions */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Category dropdown filters (mobile) or buttons (desktop) */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-slate-500" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-50 rounded-2xl border border-slate-100 p-4 h-[350px] flex flex-col justify-between">
                <div className="bg-slate-200 rounded-xl aspect-square w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mt-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-slate-200 rounded-lg flex-grow"></div>
                  <div className="h-8 bg-slate-200 rounded-lg flex-grow"></div>
                </div>
              </div>
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <AlertCircle size={40} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-dark mb-1">No Designs Found</h3>
            <p className="text-slate-500 text-sm mb-4">
              We couldn't find any designs matching your search or filters. Try adjusting your query parameters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); onCategoryChange('All'); }}
              className="bg-brand-primary text-white font-bold py-2 px-4 rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {designs.slice(0, visibleCount).map((design) => {
                const isFavorite = favorites.includes(design._id);
                const displayImg = design.imageUrl.startsWith('/uploads/') 
                  ? `http://localhost:5000${design.imageUrl}` 
                  : design.imageUrl;
                  
                return (
                  <motion.div
                    layout
                    key={design._id}
                    className="bg-white border border-slate-200 hover:border-brand-secondary/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3">
                      <img
                        src={displayImg}
                        alt={design.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Overlays: Favorites and Share */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => toggleFavorite(design._id, e)}
                          className={`p-2 rounded-full border shadow-md backdrop-blur-sm transition-colors ${
                            isFavorite 
                              ? 'bg-red-500 text-white border-red-400' 
                              : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={(e) => shareDesign(design, e)}
                          className="p-2 rounded-full bg-white/90 text-slate-600 border border-slate-200 shadow-md hover:bg-brand-light hover:text-brand-primary transition-colors"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>

                      {/* Code Tag (top left) */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 z-10">
                        {design.code}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-2">
                        <span className="text-[9px] bg-brand-light text-brand-primary font-extrabold uppercase py-0.5 px-2 rounded-md">
                          {design.category}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-brand-dark mb-1 line-clamp-1">
                        {design.name}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {design.description}
                      </p>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                          onClick={() => loadAndOpenDesign(design._id)}
                          className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-brand-light text-slate-700 hover:text-brand-primary font-bold py-2.5 rounded-xl text-xs transition duration-200"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                        
                        <button
                          onClick={() => handleWhatsAppOrder(design)}
                          className="flex items-center justify-center gap-1 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 rounded-xl text-xs shadow hover:shadow-brand-primary/10 transition duration-200"
                        >
                          <MessageCircle size={12} className="fill-white stroke-none" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < designs.length && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="bg-white hover:bg-brand-light border-2 border-brand-primary/20 hover:border-brand-primary/40 text-brand-primary font-bold py-3.5 px-8 rounded-xl transition duration-300"
                >
                  Load More Designs
                </button>
              </div>
            )}
          </>
        )}

        {/* DETAILS OVERLAY MODAL */}
        <AnimatePresence>
          {isModalOpen && selectedDesign && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row relative"
              >
                {/* Close Button */}
                <button
                  onClick={closeDetailsModal}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition z-10"
                >
                  <X size={18} />
                </button>

                {/* Left side: Image preview */}
                <div className="md:w-1/2 bg-slate-50 border-r border-slate-100 flex items-center justify-center p-6 md:p-8 aspect-square md:aspect-auto">
                  <img
                    src={selectedDesign.imageUrl.startsWith('/uploads/') 
                      ? `http://localhost:5000${selectedDesign.imageUrl}` 
                      : selectedDesign.imageUrl}
                    alt={selectedDesign.name}
                    className="max-h-[350px] md:max-h-[400px] object-contain rounded-xl"
                  />
                </div>

                {/* Right side: Specific info */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                  <div>
                    {/* Header categories */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] bg-brand-light text-brand-primary font-extrabold uppercase py-1 px-3 rounded-full">
                        {selectedDesign.category}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold py-1 px-3 rounded-full">
                        Code: {selectedDesign.code}
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-brand-dark mb-4 leading-tight">
                      {selectedDesign.name}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {selectedDesign.description}
                    </p>

                    {/* Price if available */}
                    {selectedDesign.price && (
                      <div className="mb-6 p-4 bg-brand-light/35 rounded-2xl border border-brand-primary/5 inline-block">
                        <span className="text-xs text-slate-500 font-bold block mb-1">Estimated Setup Cost</span>
                        <span className="text-2xl font-black text-brand-primary">
                          ₹{selectedDesign.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">approx</span>
                      </div>
                    )}

                    {/* Meta Tags */}
                    {selectedDesign.tags && selectedDesign.tags.length > 0 && (
                      <div className="mb-8">
                        <span className="text-xs font-bold text-slate-400 block mb-2">Search Tags</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDesign.tags.map((tag) => (
                            <span key={tag} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ordering CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleWhatsAppOrder(selectedDesign)}
                      className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-xl text-sm shadow hover:shadow-brand-primary/20 flex-grow transition"
                    >
                      <MessageCircle size={18} className="fill-white stroke-none" />
                      <span>ORDER ON WHATSAPP</span>
                    </button>
                    
                    <button
                      onClick={closeDetailsModal}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-sm transition"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

export default Gallery;
