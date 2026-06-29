import React from 'react';
import { themeColors } from '../../../../../theme';
import * as Icons from 'react-icons/fi';

// Dynamic Icon Component
const DynamicFiIcon = ({ name, className, style }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.FiStar className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

const WhyChooseWBI = ({ data }) => {
  const brandColor = themeColors?.brand?.teal || '#23b0a7';

  if (!data || !data.isActive) return null;

  const { title = 'Why Choose WBI?', items = [] } = data;
  const activeItems = items.filter(item => item.isActive);

  if (activeItems.length === 0) return null;

  return (
    <section className="py-4 px-4 mb-6">
      {/* Section Title with bottom bar */}
      <div className="flex flex-col items-start mb-6">
        <h2 className="text-[20px] font-black text-[#0F172A] tracking-tight">
          {title}
        </h2>
        <div 
          className="h-[3px] w-8 rounded mt-1.5"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      {/* Responsive list of cards */}
      {/* Horizontal scroll on mobile, flex-wrap/grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-5 overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x">
        {activeItems.map((item, index) => (
          <div
            key={item._id || index}
            className="min-w-[170px] w-[170px] lg:w-auto flex-shrink-0 bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-slate-50 snap-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#23b0a7]/10"
          >
            {/* Icon Container */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${brandColor}0D` }} // Very light brand teal background
            >
              {item.iconUrl ? (
                <img 
                  fetchPriority="low" 
                  loading="lazy" 
                  src={item.iconUrl} 
                  alt={item.title} 
                  className="w-6 h-6 object-contain" 
                />
              ) : (
                <DynamicFiIcon 
                  name={item.iconName || 'FiShield'} 
                  className="w-6 h-6" 
                  style={{ color: brandColor }} 
                />
              )}
            </div>

            {/* Title */}
            <h3 className="text-[#0F172A] font-black text-[13.5px] leading-tight mb-2">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-[#64748B] text-[11.5px] leading-snug font-medium">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseWBI;
