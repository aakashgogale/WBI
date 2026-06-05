import React, { useState, useRef, memo, useEffect } from 'react';
import { gsap } from 'gsap';
import { FiCheck } from 'react-icons/fi';
import { themeColors } from '../../../../theme';

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);

  // Simple entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: index * 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center justify-start p-1 cursor-pointer group w-full transition-transform duration-200 ease-out active:scale-95"
      onClick={onClick}
      style={{ opacity: 0 }}
    >
      <div className="relative mb-2.5 flex items-center justify-center w-[72px] h-[72px] rounded-[24px] bg-[#f8f9fa] border border-transparent group-hover:bg-[#fff3e0] group-hover:border-orange-100 transition-colors duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {icon}
        
        {/* Verification Checkmark Badge */}
        <div className="absolute top-1 right-1 bg-[#FF8A00] text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm z-10">
          <FiCheck className="w-2.5 h-2.5" strokeWidth={3} />
        </div>

        {hasSaleBadge && (
          <div className="absolute -top-1.5 -left-1.5 bg-[#EF4444] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white z-20">
            SALE
          </div>
        )}
      </div>
      <span className="text-[10px] text-center text-[#1a2b3c] font-bold leading-tight w-[110%] line-clamp-2 px-0 tracking-tight">
        {title}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

