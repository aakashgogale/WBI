import React from 'react';
import { MdStar } from 'react-icons/md';
import intenseBathroom2Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-2.jpg';
import tapRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/tap-repai.jpg';
import automaticTopLoadImage from '../../../../../assets/images/pages/Home/MostBookedServices/automatic-top-load-machine.webp';

const MostBookedServices = React.memo(({ services, onServiceClick, onAddClick, onSeeAllClick }) => {
  // Fallback to exact reference UI if DB is empty
  const fallbackServices = [
    {
      id: 'mb1',
      title: 'Washing Machine Repairs & Service',
      rating: '4.79',
      reviews: '10K+',
      price: '350',
      image: automaticTopLoadImage
    },
    {
      id: 'mb2',
      title: 'Geyser Repair & Installation',
      rating: '4.87',
      reviews: '8K+',
      price: '299',
      image: tapRepairImage // Fallback image placeholder
    },
    {
      id: 'mb3',
      title: 'AC Service and Repair',
      rating: '4.89',
      reviews: '12K+',
      price: '499',
      image: intenseBathroom2Image // Fallback image placeholder
    }
  ];

  const serviceList = (services && services.length > 0) ? services : fallbackServices;

  return (
    <div className="mb-6 px-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
          Most booked services
        </h2>
        <button 
          className="text-[14px] font-medium text-[#10AFA5] hover:opacity-80 transition-opacity"
          onClick={onSeeAllClick}
        >
          See All
        </button>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide gap-3.5 pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {serviceList.map((service, index) => (
          <div 
            key={service.id || index}
            className="flex-shrink-0 w-[156px] sm:w-[170px] snap-center bg-white rounded-[16px] overflow-hidden border border-[#F1F5F9] shadow-[0_4px_16px_rgba(15,23,42,0.04)] cursor-pointer"
            onClick={() => onServiceClick?.(service)}
          >
            {/* Image section */}
            <div className="h-[96px] w-full bg-[#f8fafc] relative">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            
            {/* Content section */}
            <div className="p-3">
              <h3 className="text-[#0F172A] font-bold text-[13px] leading-[1.3] mb-2 min-h-[34px] line-clamp-2 pr-2">
                {service.title}
              </h3>
              
              <div className="flex items-center gap-1 mb-2.5">
                <MdStar className="text-[#F59E0B] w-3.5 h-3.5" />
                <span className="text-[#0F172A] font-bold text-[11px]">{service.rating || '4.8'}</span>
                <span className="text-[#64748B] text-[11px]">({service.reviews || '10K+'})</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] font-medium text-[11px]">From</span>
                <span className="text-[#10AFA5] font-extrabold text-[13px] tracking-tight">₹{service.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

MostBookedServices.displayName = 'MostBookedServices';

export default MostBookedServices;

