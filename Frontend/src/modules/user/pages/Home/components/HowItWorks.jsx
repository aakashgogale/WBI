import React from 'react';
import { FiSearch, FiCalendar, FiUser, FiShield } from 'react-icons/fi';
import { themeColors } from '../../../../../theme';

const steps = [
  {
    id: 1,
    title: 'Search Service',
    description: 'Search for the service you need',
    icon: FiSearch,
  },
  {
    id: 2,
    title: 'Book Service',
    description: 'Choose time & book your service',
    icon: FiCalendar,
  },
  {
    id: 3,
    title: 'Expert Arrives',
    description: 'Our expert will reach your location',
    icon: FiUser,
  },
  {
    id: 4,
    title: 'Service Done',
    description: 'Sit back & relax, we do the rest',
    icon: FiShield,
  }
];

const HowItWorks = () => {
  const brandColor = themeColors?.brand?.teal || '#23b0a7';

  return (
    <section className="py-2 px-4 mb-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">How It Works</h2>
        <button 
          className="text-[14px] font-medium flex items-center gap-1 active:opacity-70 transition-opacity"
          style={{ color: brandColor }}
        >
          See All 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="relative">
        {/* Dotted connecting line background */}
        <div 
          className="absolute top-[85px] left-[15%] right-[15%] h-[2px] z-0" 
          style={{
            backgroundImage: `linear-gradient(to right, ${brandColor} 33%, transparent 0%)`,
            backgroundPosition: 'bottom',
            backgroundSize: '12px 2px',
            backgroundRepeat: 'repeat-x',
            opacity: 0.5
          }}
        />

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className="min-w-[150px] w-[150px] flex-shrink-0 bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-gray-50 snap-center relative"
              >
                {/* Icon Circle */}
                <div 
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5 relative"
                  style={{ backgroundColor: `${brandColor}0D` }} // very light teal
                >
                  <Icon className="w-7 h-7" style={{ color: brandColor }} strokeWidth={1.5} />
                  
                  {/* Number Badge */}
                  <div 
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white border-2 border-white shadow-sm"
                    style={{ backgroundColor: brandColor }}
                  >
                    {step.id}
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-[#0F172A] font-bold text-[14px] leading-tight mb-2 mt-2">
                  {step.title}
                </h3>
                <p className="text-[#64748B] text-[12px] leading-snug">
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
