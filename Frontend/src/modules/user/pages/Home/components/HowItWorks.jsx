import React from 'react';
import { themeColors } from '../../../../../theme';
import * as Icons from 'react-icons/fi';

// Dynamic Icon Component
const DynamicFiIcon = ({ name, className, style }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.FiSearch className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

const HowItWorks = ({ steps = [], isLoading = false, data = null }) => {
  const brandColor = themeColors?.brand?.teal || '#23b0a7';

  if (isLoading) {
    return <div className="h-40 bg-gray-50 animate-pulse rounded-2xl mx-4" />;
  }

  // Use dynamic data if provided
  const activeSection = data && data.isActive;
  if (data && !activeSection) return null;

  const sectionTitle = data?.title || 'How It Works';
  const displaySteps = data?.items?.length > 0 
    ? data.items.filter(s => s.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) 
    : steps;

  if (!displaySteps || displaySteps.length === 0) return null;

  return (
    <section className="py-4 px-4 mb-6 relative overflow-hidden">
      {/* Section Title with bottom bar */}
      <div className="flex flex-col items-start mb-6">
        <h2 className="text-[20px] font-black text-[#0F172A] tracking-tight">
          {sectionTitle}
        </h2>
        <div 
          className="h-[3px] w-8 rounded mt-1.5"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      <div className="relative">
        {/* Dotted connecting line background */}
        <div 
          className="absolute top-[28px] left-[12%] right-[12%] h-[1px] z-0" 
          style={{
            backgroundImage: `linear-gradient(to right, ${brandColor} 33%, transparent 0%)`,
            backgroundPosition: 'bottom',
            backgroundSize: '10px 1px',
            backgroundRepeat: 'repeat-x',
            opacity: 0.3
          }}
        />

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x relative z-10">
          {displaySteps.map((step, index) => {
            return (
              <div 
                key={step._id || index} 
                className="min-w-[125px] w-[125px] flex-shrink-0 flex flex-col items-center text-center snap-center relative"
              >
                {/* Icon Circle */}
                <div 
                  className="w-14 h-14 rounded-full border bg-white flex items-center justify-center relative shadow-sm transition-transform duration-300 hover:scale-105"
                  style={{ borderColor: `${brandColor}30` }} // border with opacity
                >
                  {step.iconUrl ? (
                    <img 
                      fetchPriority="low" 
                      loading="lazy" 
                      src={step.iconUrl} 
                      alt={step.title} 
                      className="w-6 h-6 object-contain animate-fadeIn" 
                    />
                  ) : (
                    <DynamicFiIcon 
                      name={step.iconName || 'FiSearch'} 
                      className="w-6 h-6" 
                      style={{ color: brandColor }} 
                    />
                  )}
                  
                  {/* Number Badge */}
                  <div 
                    className="absolute -bottom-2 bg-[#23b0a7] text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm"
                    style={{ backgroundColor: brandColor }}
                  >
                    {step.stepNumber || (index + 1)}
                  </div>
                </div>

                {/* Step Subtitle */}
                <span 
                  className="text-[9.5px] font-black uppercase tracking-wider mt-4"
                  style={{ color: brandColor }}
                >
                  Step {step.stepNumber || (index + 1)}
                </span>

                {/* Text Content */}
                <h3 className="text-[#0F172A] font-black text-[12px] leading-tight mt-1 mb-1 max-w-[110px] truncate-2-lines">
                  {step.title}
                </h3>
                <p className="text-[#64748B] text-[10.5px] leading-snug font-medium max-w-[115px]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
