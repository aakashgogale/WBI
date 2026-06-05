import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const DetailedServiceCard = memo(({ image, title, rating, reviews, price, originalPrice, discount, onClick, onAddClick }) => {
  const cardRef = useRef(null);

  // Format price (remove non-digits, then format)
  const formatPrice = (p) => {
    if (!p) return null;
    const clean = p.toString().replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-IN').format(clean);
  };

  const displayPrice = formatPrice(price);
  const displayOriginalPrice = formatPrice(originalPrice);

  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;

      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: '0 12px 24px rgba(12, 184, 182, 0.15), 0 6px 12px rgba(12, 184, 182, 0.1)',
          duration: 0.3,

          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: themeColors.cardShadow,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleClick = () => {
        gsap.to(card, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('click', handleClick);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-full flex bg-white rounded-[24px] overflow-hidden cursor-pointer group p-3.5"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.02)'
      }}
      onClick={onClick}
    >
      <div className="relative rounded-[16px] overflow-hidden w-[100px] h-[100px] shrink-0 border border-gray-100 shadow-sm bg-gray-50">
        {discount && (
          <div
            className="absolute top-1 left-1 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm z-10 bg-brand"
          >
            {discount.toString().toUpperCase().includes('OFF') ? discount : `${discount}% OFF`}
          </div>
        )}
        {image ? (
          <img
            src={optimizeCloudinaryUrl(image, { width: 200, quality: 'auto' })}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-light">
            <span className="font-bold text-[10px] text-brand">No Image</span>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="pl-4 pr-1 py-1 flex flex-col flex-1 min-w-0">
        <h3 className="text-[16px] font-extrabold text-gray-900 leading-snug mb-1 line-clamp-2 text-ellipsis overflow-hidden">
          {title}
        </h3>
        <p className="text-[12px] font-medium text-gray-400 mb-2 truncate flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Verified Expert
        </p>

        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-black text-gray-900">₹{displayPrice}</span>
              {displayOriginalPrice && (
                <span className="text-[12px] text-gray-400 line-through">₹{displayOriginalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 bg-gray-50 px-1.5 py-0.5 rounded-md w-max">
              <AiFillStar className="w-3.5 h-3.5 text-[#FFB800]" />
              <span className="text-[11px] text-gray-800 font-bold">{rating}</span>
              <span className="text-[10px] text-gray-300 mx-0.5">•</span>
              <span className="text-[11px] text-gray-500">{reviews || '10k+'}</span>
            </div>
          </div>
          
          <button 
            className="px-5 py-2 bg-brand-light text-brand font-extrabold rounded-xl text-[13px] transition-all border border-brand/20 shadow-sm group-hover:bg-brand group-hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddClick) onAddClick();
            }}
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
});

DetailedServiceCard.displayName = 'DetailedServiceCard';

export default DetailedServiceCard;

