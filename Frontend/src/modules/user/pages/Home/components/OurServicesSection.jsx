import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';
import api from '../../../../../services/api';
import ServiceIconRenderer from '../../../components/common/ServiceIconRenderer';

// We rely on ServiceIconRenderer for all icons to maintain a consistent aesthetic

const OurServicesSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('one_time'); // Default to one_time

  // Fetch all categories and services in one go
  const { data, isLoading, error } = useQuery({
    queryKey: ['homeServices'],
    queryFn: async () => {
      const response = await api.get('/user/home/services');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });

  if (isLoading) {
    return (
      <section className="py-4 px-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-hidden mb-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />)}
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="h-32 w-28 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />)}
        </div>
      </section>
    );
  }

  if (error || !data?.success) {
    return null; // Fail silently so it doesn't break home page
  }

  const { categories = [], services = {} } = data;

  const displayCategories = [...categories];
  const showMoreTab = true; 

  const activeServices = services[activeTab] || [];

  const handleServiceClick = (service) => {
    if (service.type === 'one_time') {
      navigate(`/user/service/${service.slug}`);
    } else {
      navigate(`/user/services/${service.slug}/details`);
    }
  };

  return (
    <section className="py-4 bg-transparent relative z-10">
      <div className="px-4 flex justify-between items-center mb-3">
        <h2 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">Our Services</h2>
        <button 
          onClick={() => navigate('/user/services')}
          className="text-[11px] font-bold text-[#10AFA5] border border-[#10AFA5]/20 bg-[#E5F3F2] px-2.5 py-1 rounded-full active:scale-95 transition-transform"
        >
          View All Services
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 px-4 scrollbar-hide snap-x mb-1">
        {displayCategories.map((category) => {
          const isActive = activeTab === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap snap-start flex-shrink-0 transition-all ${
                isActive
                  ? 'border-[#10AFA5] text-[#10AFA5] bg-[#F8FCFC]'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 flex items-center justify-center rounded-md overflow-hidden ${isActive ? 'bg-[#E5F3F2] text-[#10AFA5]' : 'bg-gray-100 text-gray-400'}`}>
                <ServiceIconRenderer categoryName={category.name} className="w-3 h-3 object-cover" />
              </div>
              {category.name}
            </button>
          );
        })}
        {showMoreTab && (
          <button
            onClick={() => navigate('/user/services')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 text-[11px] font-bold whitespace-nowrap snap-start flex-shrink-0 hover:bg-gray-50 transition-all`}
          >
            <div className="w-4 h-4 flex items-center justify-center rounded-md bg-gray-100 text-gray-400">
              <FiMoreHorizontal className="w-3 h-3" />
            </div>
            More
          </button>
        )}
      </div>

      {/* Service Cards */}
      <div className="flex overflow-x-auto gap-3 pb-4 px-4 scrollbar-hide snap-x pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-3 w-full"
          >
            {activeServices.length > 0 ? (
              activeServices.map((service, index) => {
                return (
                  <div
                    key={service.serviceId}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-w-[92px] max-w-[92px] snap-center flex-shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-12 h-12 mb-1.5 relative flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-sm border border-gray-50">
                      <ServiceIconRenderer categoryName={service.name} className="w-full h-full object-cover drop-shadow-sm" />
                    </div>
                    <h3 className="text-[10px] font-bold text-[#0F172A] text-center leading-tight mb-1 line-clamp-2 min-h-[26px] flex items-center">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] font-medium text-gray-400">
                      <span className="text-[#F59E0B] flex items-center gap-0.5">⭐ {service.rating || '4.8'}</span>
                      <span>({service.reviewCount || '230'})</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="w-full py-6 flex items-center justify-center text-xs text-gray-400 font-medium">
                No services available right now.
              </div>
            )}
            {activeServices.length > 0 && (
              <div
                onClick={() => navigate('/user/services')}
                className="bg-gray-50 rounded-xl p-2.5 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-w-[92px] max-w-[92px] snap-center flex-shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-[#10AFA5]">
                  <FiChevronRight className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#10AFA5] text-center">View All<br/>Services</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default OurServicesSection;
