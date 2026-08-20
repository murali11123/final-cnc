import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Search, Sparkles, MessageCircle, Eye } from 'lucide-react';
import { searchImageSimilarity } from '../services/api';
import toast from 'react-hot-toast';

const AISearch = ({ onViewDesign }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const fileInputRef = useRef(null);
  const loadingIntervalRef = useRef(null);

  const loadingTexts = [
    'Analyzing uploaded CNC design...',
    'Extracting geometric patterns...',
    'Generating neural vector embeddings...',
    'Matching features against database...',
    'Calculating similarity scores...'
  ];

  // Drag & Drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum image size is 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setResults(null); // clear old search results
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerSearch = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first.');
      return;
    }

    setIsSearching(true);
    setLoadingTextIndex(0);
    setResults(null);

    // Animate loading text shifts
    loadingIntervalRef.current = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 1500);

    try {
      const data = await searchImageSimilarity(imageFile, categoryFilter);
      setResults(data);
      toast.success(data.noMatch ? 'Analysis complete. Check recommendations.' : 'Similar designs found!');
    } catch (error) {
      console.error('AI search failed:', error);
      toast.error(error.response?.data?.message || 'AI similarity search failed. Try again.');
    } finally {
      clearInterval(loadingIntervalRef.current);
      setIsSearching(false);
    }
  };

  // WhatsApp order text builder
  const handleWhatsAppClick = (design, score) => {
    const text = `Hello,
I found this CNC design using the AI Design Search (Similarity match: ${score}%).
Design Name: ${design.name}
Design Code: ${design.code}
Category: ${design.category}
I would like more information about this design.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/917095988918?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExploreAll = () => {
    const el = document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="ai-search" className="py-20 bg-slate-50 border-t border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center items-center gap-2 text-brand-primary font-bold text-sm tracking-widest uppercase mb-3">
            <Sparkles size={16} />
            <span>AI Powered Scanning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            FIND YOUR PERFECT CNC DESIGN
          </h2>
          <p className="text-slate-500 font-medium">
            Upload a CNC design image, sketch, or photograph, and discover the exact or visually similar carvings from our pre-engineered collections.
          </p>
        </div>

        {/* Uploader Row */}
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-xl mb-12 relative overflow-hidden">
          {/* Category Filter for searching */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Within Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Categories</option>
              <option value="2D Wall Panels">2D Wall Panels</option>
              <option value="Temple Designs">Temple Designs</option>
              <option value="Custom CNC">Custom CNC</option>
              <option value="Wooden Crafts">Wooden Crafts</option>
            </select>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current.click()}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 min-h-[220px] ${
              dragActive 
                ? 'border-brand-primary bg-brand-light/30 scale-[0.99]' 
                : imagePreview 
                  ? 'border-brand-light bg-slate-50 cursor-default' 
                  : 'border-slate-300 hover:border-brand-primary hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isSearching}
            />

            {!imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-brand-light rounded-full text-brand-primary animate-pulse-slow">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-1">
                    Drag & Drop image file here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, JPEG, PNG, or WEBP (Max 5MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="w-full relative flex flex-col items-center">
                {/* Image Preview Container */}
                <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-slate-200 bg-white mb-4 flex items-center justify-center">
                  <img src={imagePreview} alt="Upload Preview" className="max-w-full max-h-full object-contain" />
                  
                  {/* Neural Scanning animation overlay when searching */}
                  {isSearching && (
                    <div className="absolute inset-0 bg-brand-primary/10 flex flex-col justify-between overflow-hidden">
                      <motion.div
                        className="w-full h-1 bg-gradient-to-r from-transparent via-brand-secondary to-transparent"
                        animate={{ y: [0, 192, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="text-xs font-bold text-slate-600 truncate max-w-full px-4 mb-4">
                  {imageFile?.name}
                </div>

                {/* Action Buttons */}
                {!isSearching && (
                  <div className="flex gap-3">
                    <button
                      onClick={removeImage}
                      className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition"
                    >
                      <X size={14} />
                      Remove
                    </button>
                    <button
                      onClick={triggerSearch}
                      className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-bold py-2 px-5 rounded-xl shadow hover:shadow-brand-primary/20 transition"
                    >
                      <Search size={14} />
                      Search Design
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Searching / Analyzing Loading overlay */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
              >
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-brand-light rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-brand-primary rounded-full animate-spin"></div>
                  <Sparkles size={24} className="text-brand-primary animate-pulse" />
                </div>
                
                <h3 className="text-sm font-bold text-brand-dark mb-1 animate-pulse">
                  {loadingTexts[loadingTextIndex]}
                </h3>
                <p className="text-xs text-slate-400">
                  Calculating pattern vector indices...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RESULTS PANEL */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* 1. Honest matching fallback (No match found) */}
            {results.noMatch && (
              <div className="bg-white border border-brand-light rounded-3xl p-8 max-w-2xl mx-auto text-center shadow-lg">
                <div className="p-4 bg-orange-50 text-orange-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-orange-100">
                  <X size={28} />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">No Close Match Found</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  We scanned our database but couldn't find an exact or highly similar CNC carving style matching your image (all similarity indices scored below our 72% confidence threshold).
                </p>
                <button
                  onClick={handleExploreAll}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-xl transition shadow hover:shadow-brand-primary/20 text-sm"
                >
                  Explore All CNC Designs
                </button>
              </div>
            )}

            {/* 2. Exact / High confidence match */}
            {results.exactMatch && (
              <div>
                <h3 className="text-xs font-extrabold text-brand-primary tracking-widest uppercase mb-4 border-b border-brand-light pb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                  EXACT MATCH (90%+ SIMILARITY)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                  <DesignResultCard
                    design={results.exactMatch}
                    onView={() => onViewDesign(results.exactMatch._id)}
                    onWhatsApp={() => handleWhatsAppClick(results.exactMatch, results.exactMatch.similarity)}
                  />
                </div>
              </div>
            )}

            {/* 3. Similar designs list */}
            {results.similarDesigns && results.similarDesigns.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-slate-500 tracking-widest uppercase mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary"></span>
                  SIMILAR DESIGNS (72% - 89% SIMILARITY)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.similarDesigns.map((design) => (
                    <DesignResultCard
                      key={design._id}
                      design={design}
                      onView={() => onViewDesign(design._id)}
                      onWhatsApp={() => handleWhatsAppClick(design, design.similarity)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Recommended fallbacks / standard catalog */}
            {results.recommendedDesigns && results.recommendedDesigns.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-slate-500 tracking-widest uppercase mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  RECOMMENDED DESIGNS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.recommendedDesigns.map((design) => (
                    <DesignResultCard
                      key={design._id}
                      design={design}
                      onView={() => onViewDesign(design._id)}
                      onWhatsApp={() => handleWhatsAppClick(design, 'N/A')}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Internal result design card component
const DesignResultCard = ({ design, onView, onWhatsApp }) => {
  const isSimilarityAvailable = design.similarity !== undefined && design.similarity !== 'N/A';
  const displayImageUrl = design.imageUrl.startsWith('/uploads/') 
    ? `http://localhost:5000${design.imageUrl}` 
    : design.imageUrl;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl hover:border-brand-secondary/40 transition-all duration-300 flex flex-col group h-full">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-2">
        <img
          src={displayImageUrl}
          alt={design.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Similarity index pill */}
        {isSimilarityAvailable && (
          <div className="absolute top-3 right-3 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 z-10 flex items-center gap-1">
            <Sparkles size={8} className="text-brand-secondary animate-pulse" />
            <span>Match: {design.similarity}%</span>
          </div>
        )}
      </div>

      {/* Description details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] bg-brand-light text-brand-primary font-extrabold uppercase py-0.5 px-2 rounded-md">
            {design.category}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {design.code}
          </span>
        </div>
        
        <h4 className="text-sm font-bold text-brand-dark mb-1 line-clamp-1">
          {design.name}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {design.description}
        </p>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-brand-light text-slate-700 hover:text-brand-primary font-bold py-2 rounded-xl text-xs transition duration-200"
          >
            <Eye size={12} />
            <span>View Details</span>
          </button>
          
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-1 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 rounded-xl text-xs shadow hover:shadow-brand-primary/10 transition duration-200"
          >
            <MessageCircle size={12} className="fill-white stroke-none" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISearch;
export { DesignResultCard };
