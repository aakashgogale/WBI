import React from 'react';
import { motion } from 'framer-motion';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const PopularBrandsWeService = ({ brands = [], onSeeAllClick }) => {
  // Defined preferred order based on user request
  const preferredOrder = [
    'LG', 'SAMSUNG', 'VOLTAS', 'Whirlpool', 'Panasonic', 'Haier', 'BOSCH'
  ];

  // Sort brands to put preferred ones first, then slice to exactly 7
  const displayBrands = [...brands].sort((a, b) => {
    const titleA = a.title?.toUpperCase();
    const titleB = b.title?.toUpperCase();
    
    let indexA = preferredOrder.findIndex(brand => titleA && titleA.includes(brand.toUpperCase()));
    let indexB = preferredOrder.findIndex(brand => titleB && titleB.includes(brand.toUpperCase()));
    
    // If neither is in preferred list, maintain original order
    if (indexA === -1 && indexB === -1) return 0;
    // If A is not in preferred list, push it down
    if (indexA === -1) return 1;
    // If B is not in preferred list, push it down
    if (indexB === -1) return -1;
    
    // Sort by preferred order index
    return indexA - indexB;
  }).slice(0, 7);

  return (
    <div className="mb-4 px-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
          Popular Brands We Service
        </h2>
        <button 
          className="text-[14px] font-medium text-[#10AFA5] hover:opacity-80 transition-opacity flex items-center"
          onClick={onSeeAllClick}
        >
          See All <span className="ml-1 text-[12px]">&gt;</span>
        </button>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {displayBrands.map((brand) => (
          <motion.div
            key={brand.id}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 w-[95px] h-[64px] bg-white rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-2 cursor-pointer snap-center relative overflow-hidden group"
          >
            {brand.iconUrl ? (
              <div className="flex flex-col items-center justify-center w-full h-full gap-1">
                <img 
                  src={toAssetUrl(brand.iconUrl)} 
                  alt={brand.title} 
                  className="h-[24px] max-w-full object-contain opacity-95 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ mixBlendMode: 'multiply', filter: 'brightness(1.1) contrast(1.1)' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.parentElement?.nextSibling) {
                      e.target.parentElement.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider truncate w-full text-center">
                  {brand.title}
                </span>
              </div>
            ) : null}
            
            {/* Fallback Text if logo is missing entirely or errors out */}
            <div 
              className="absolute inset-0 flex items-center justify-center text-center p-2 bg-white" 
              style={{ display: brand.iconUrl ? 'none' : 'flex' }}
            >
              <span className="font-bold text-[11px] leading-[1.1] text-[#0F172A] uppercase tracking-wide truncate whitespace-normal w-full" style={{ wordBreak: 'break-word' }}>
                {brand.title}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PopularBrandsWeService;
