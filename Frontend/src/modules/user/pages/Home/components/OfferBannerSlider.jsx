import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from '../../../../../components/common';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const OfferBannerSlider = ({ banners = [], onBannerClick, title = "Special Offers", hideTitle = false, autoPlayInterval = 4000 }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Wrap around index
  const imageIndex = Math.abs(page % banners.length);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    if (isHovered || isDragging) return;

    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [banners.length, isHovered, isDragging, page]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden my-6 px-4">
      {!hideTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.2rem] font-[800] text-[#0A1929]">{title}</h2>
        </div>
      )}
      
      <div 
        className="relative w-full aspect-[21/10] rounded-[20px] overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, { offset, velocity }) => {
              setIsDragging(false);
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                paginate(1);
              } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                paginate(-1);
              }
            }}
            className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
            onClick={() => {
              // Prevent click event if dragging
              if (!isDragging && onBannerClick) {
                onBannerClick(banners[imageIndex]);
              }
            }}
          >
            <OptimizedImage
              src={banners[imageIndex]?.imageUrl}
              alt={banners[imageIndex]?.title || "Banner"}
              className="w-full h-full object-fill bg-gray-50"
              priority={true}
            />
            {/* Subtle gradient overlay for better text/button contrast if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next Buttons */}
        {banners.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newDirection = idx > imageIndex ? 1 : -1;
                setPage([page + (idx - imageIndex), newDirection]);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                imageIndex === idx ? 'bg-white w-6 shadow-[0_0_8px_rgba(0,0,0,0.5)]' : 'bg-white/60 w-2 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferBannerSlider;
