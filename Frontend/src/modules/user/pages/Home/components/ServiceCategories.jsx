import React, { useState, useEffect } from 'react';
import ServiceIconRenderer from '../../../components/common/ServiceIconRenderer';

const THEME = {
  brand: '#4F46E5', // Indigo
  text: '#111827',
};

const ServiceCategories = React.memo(({ categories = [], onCategoryClick, onSeeAllClick }) => {
  const displayCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const sliced = categories.slice(0, 4);
    return [...sliced, { id: 'more', title: 'More Services', isMore: true }];
  }, [categories]);

  if (displayCategories.length === 0) return null;

  return (
    <div className="px-4 mt-0 mb-4">
      {/* 5 columns inside a white rounded box */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(16,175,165,0.06)] border border-[#E5F3F2] p-4 flex items-start justify-between">
        {displayCategories.map((category, index) => {
          return (
            <div 
              key={category.id || index} 
              className="flex flex-col items-center justify-start cursor-pointer w-1/5 px-1 active:scale-95 transition-transform"
              onClick={() => {
                if (category.isMore) {
                  onSeeAllClick?.();
                } else {
                  onCategoryClick?.(category);
                }
              }}
            >
              {/* Icon Container without redundant padding/background */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-2 overflow-hidden flex-shrink-0">
                {category.isMore ? (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F8FAFC] rounded-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 w-6 h-6">
                      <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                      <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                      <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                      <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#10AFA5]">
                    {category.icon ? (
                      <img src={category.icon} className="w-full h-full object-contain" alt={category.title} />
                    ) : (
                      <ServiceIconRenderer categoryName={category.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Category Title - Fixed height to perfectly align all texts */}
              <div className="h-[32px] sm:h-[36px] flex items-start justify-center w-full">
                <span className="text-[10px] sm:text-[11px] font-bold text-center leading-[1.2] line-clamp-2 w-full break-words text-[#0F172A]">
                  {category.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

