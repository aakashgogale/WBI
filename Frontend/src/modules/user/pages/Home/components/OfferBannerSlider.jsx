import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OfferBannerSlider = ({ banners = [], onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // Change banner every 4 seconds

    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden my-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[1.2rem] font-[800] text-[#0A1929]">Special Offers</h2>
      </div>
      <div className="relative w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden shadow-sm">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={banners[currentIndex].imageUrl}
            alt="Offer Banner"
            onClick={() => onBannerClick && onBannerClick(banners[currentIndex])}
            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer bg-gray-100 rounded-2xl"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferBannerSlider;
