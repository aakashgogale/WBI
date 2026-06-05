import React, { memo, useState, useEffect, useRef } from 'react';
import { themeColors } from '../../../../../theme';

const InstantBookingBanner = memo(({ promos = [], onPromoClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const displayPromos = promos.length > 0 ? promos : [
    {
      id: 'default-1',
      badge: 'LIMITED TIME OFFER',
      title: 'AC Service at Just ₹499',
      subtitle: "UP TO 50% OFF",
      description: "Full checkup | Gas refill | Deep cleaning",
      imageUrl: '/img/Technicians.png',
      isDefault: true
    },
    {
      id: 'default-2',
      badge: 'SPECIAL DEAL',
      title: 'Washing Machine Repair at ₹299',
      subtitle: "EXPERT SERVICE",
      description: "Motor check | Drum cleaning | Wiring check",
      imageUrl: '/img/Technicians.png',
      isDefault: true
    },
    {
      id: 'default-3',
      badge: 'WINTER READY',
      title: 'Geyser Servicing at ₹199',
      subtitle: "STAY WARM",
      description: "Heating element check | Tank flush | Safety check",
      imageUrl: '/img/Technicians.png',
      isDefault: true
    },
    {
      id: 'default-4',
      badge: 'HEALTH FIRST',
      title: 'RO Purifier Service at ₹399',
      subtitle: "PURE WATER",
      description: "Filter change | TDS check | Tank cleaning",
      imageUrl: '/img/Technicians.png',
      isDefault: true
    }
  ];

  const originalLength = displayPromos.length;
  // Duplicate promos to create a seamless infinite loop (4 sets gives plenty of manual swipe runway)
  const extendedPromos = originalLength > 1 
    ? [...displayPromos, ...displayPromos, ...displayPromos, ...displayPromos] 
    : displayPromos;

  // Auto-scroll seamless loop
  useEffect(() => {
    if (originalLength <= 1) return;

    let timeoutId;
    let rAF1, rAF2;
    
    const startAutoScroll = () => {
      timeoutId = setTimeout(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        
        const firstItem = container.children[0];
        if (!firstItem) return;
        
        const itemWidth = firstItem.offsetWidth + 16; // +16 for gap-4
        const currentRawIndex = Math.round(container.scrollLeft / itemWidth);
        
        // When we reach the end of the first original set, we silently jump back
        // to the exact same visual position in the first set, THEN smoothly scroll to next.
        if (currentRawIndex >= originalLength) {
          container.style.scrollBehavior = 'auto';
          const resetIndex = currentRawIndex % originalLength;
          container.scrollLeft = resetIndex * itemWidth;
          
          // Use double requestAnimationFrame to ensure the instant jump is painted 
          // before we re-enable smooth scrolling
          rAF1 = requestAnimationFrame(() => {
            rAF2 = requestAnimationFrame(() => {
              if (!scrollContainerRef.current) return;
              container.style.scrollBehavior = 'smooth';
              container.scrollTo({ left: (resetIndex + 1) * itemWidth, behavior: 'smooth' });
            });
          });
        } else {
          // Normal smooth scroll
          container.scrollTo({ left: (currentRawIndex + 1) * itemWidth, behavior: 'smooth' });
        }
        
        startAutoScroll();
      }, 3500); 
    };

    startAutoScroll();

    return () => {
      clearTimeout(timeoutId);
      if (rAF1) cancelAnimationFrame(rAF1);
      if (rAF2) cancelAnimationFrame(rAF2);
    };
  }, [originalLength]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstItem = container.children[0];
      if (!firstItem) return;
      
      const itemWidth = firstItem.offsetWidth + 16;
      const rawIndex = Math.floor((container.scrollLeft + itemWidth / 2) / itemWidth);
      const index = rawIndex % originalLength;
      
      if (index !== currentIndex && index >= 0 && index < originalLength) {
        setCurrentIndex(index);
      }
    }
  };

  const cardGradients = [
    'linear-gradient(135deg, #FFA200 0%, #FFC500 100%)', // Vibrant Orange
    'linear-gradient(135deg, #A57EFF 0%, #6C2FF2 100%)', // Deep Violet
    'linear-gradient(135deg, #FF62A5 0%, #FF8960 100%)', // Sunset Rose
    'linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)', // Ocean Blue
    'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', // Ruby Red
    'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', // Emerald Green
  ];

  return (
    <div className="mt-2 mb-4">
      <div className="relative w-full group">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 pb-4 pt-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {extendedPromos.map((promo, rawIdx) => {
            const idx = rawIdx % originalLength;
            return (
            <div 
              key={`${promo.id || idx}-${rawIdx}`} 
              className="flex-shrink-0 w-full snap-center relative cursor-pointer rounded-[24px] overflow-hidden"
              onClick={() => onPromoClick && onPromoClick(promo)}
              style={{ minHeight: '170px' }}
            >
              {promo.imageUrl && !promo.isDefault ? (
                // Full bleed image from backend
                <img 
                  src={promo.imageUrl} 
                  alt={promo.title || "Offer"} 
                  className="w-full h-full absolute inset-0 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                // Dynamic Teal Banner Layout
                <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-[#E5F3F2] to-[#CCE8E5]">
                  <div className="p-5 flex flex-col justify-center h-full relative z-10 w-[65%]">
                    {/* Badge */}
                    <div className="inline-flex bg-white/60 text-[#10AFA5] text-[8px] sm:text-[9px] font-extrabold px-2.5 py-1 rounded mb-2 uppercase tracking-wide w-max">
                      {promo.badge || 'LIMITED TIME OFFER'}
                    </div>
                    
                    {/* Title & Price */}
                    <h3 className="text-[#0F172A] text-[20px] sm:text-[24px] font-black leading-[1.15] mb-2 tracking-tight whitespace-pre-line">
                      {promo.title ? promo.title.replace(' at ', ' at\n') : 'AC Service at\nJust ₹499'}
                    </h3>
                    
                    {/* Description/Subtext */}
                    <p className="text-[#64748B] font-medium text-[10px] sm:text-[11px] leading-snug mb-3 line-clamp-1">
                       {promo.description || 'Full checkup | Gas refill | Deep cleaning'}
                    </p>
                    
                    {/* Action Button */}
                    <button className="bg-[#10AFA5] text-white text-[12px] font-bold px-4 py-2 rounded-full w-max flex items-center gap-1.5 hover:bg-[#0E9B92] transition-colors">
                      Book Now 
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>

                  {/* Right Side Illustration */}
                  <div className="absolute right-0 bottom-0 max-w-[45%] h-full flex items-end justify-end pointer-events-none z-10">
                    <img 
                      src={promo.imageUrl || "/img/Technicians.png"} 
                      alt={promo.title || "Offer"} 
                      className="object-contain h-[105%] object-right-bottom"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Standard Circle Loop Indicator */}
        {displayPromos.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none">
            {displayPromos.map((_, index) => (
              <div 
                key={index} 
                className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'w-4 h-1.5 bg-[#10AFA5]' : 'w-1.5 h-1.5 bg-[#CBD5E1]'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

InstantBookingBanner.displayName = 'InstantBookingBanner';

export default InstantBookingBanner;
