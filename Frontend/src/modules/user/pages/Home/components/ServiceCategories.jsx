import React from 'react';
import ServiceIconRenderer from '../../../components/common/ServiceIconRenderer';

const THEME = {
  brand: '#4F46E5', // Indigo
  text: '#111827',
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {
  // Fallback to exact reference UI if DB is empty
  const fallbackCategories = [
    { id: 'ac', title: 'AC Service' },
    { id: 'washing', title: 'Washing Machine' },
    { id: 'geyser', title: 'Geyser Repair' },
    { id: 'ro', title: 'RO Service' }
  ];

  const hasData = Array.isArray(categories) && categories.length > 0;
  const displayCategories = hasData ? categories.slice(0, 4) : fallbackCategories;
  
  // Ensure "More Services" is always the 5th item
  displayCategories.push({ id: 'more', title: 'More Services', isMore: true });

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
              {/* Soft Teal Box Container */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-2 overflow-hidden">
                {category.isMore ? (
                  <div className="grid grid-cols-2 gap-1 w-6 h-6">
                    <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                    <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                    <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                    <div className="rounded-full border-2 border-[#10AFA5] w-full h-full"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <ServiceIconRenderer 
                      categoryName={category.title} 
                    />
                  </div>
                )}
              </div>
              
              {/* Category Title */}
              <span className="text-[10px] sm:text-[11px] font-medium text-center leading-tight line-clamp-2 w-full break-words text-[#0F172A]">
                {category.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

