import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import ServiceIconRenderer from '../../../components/common/ServiceIconRenderer';

const TrendingServicesSection = () => {
  const navigate = useNavigate();
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const m = await import('../../../../../services/userHomeService');
        const res = await m.userHomeService.getMostBooked();
        if (res.success && res.data && res.data.length > 0) {
          const filtered = res.data.filter(s =>
            !s.name.toLowerCase().includes('fan install') &&
            !s.name.toLowerCase().includes('fan repair') &&
            !s.name.toLowerCase().includes('top load') &&
            !s.name.toLowerCase().includes('automatic')
          ).map(s => ({
            id: s._id,
            title: s.name,
            slug: s.slug || s._id
          }));
          setTrendingServices(filtered.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load trending services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleResultClick = (service) => {
    if (service.slug) {
      navigate(`/user/service/${service.slug}`);
    }
  };

  if (loading || trendingServices.length === 0) return null;

  return (
    <section className="px-4 mt-6">
      <h3 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2 mb-3">
        <FiTrendingUp className="text-[#10AFA5]" /> Trending Services
      </h3>
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,175,165,0.06)] border border-[#E5F3F2] overflow-hidden divide-y divide-gray-50">
        {trendingServices.map((service) => (
          <button
            key={service.id}
            onClick={() => handleResultClick(service)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 bg-white transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <ServiceIconRenderer categoryName={service.title} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-800 group-hover:text-[#10AFA5] transition-colors text-[15px]">{service.title}</span>
            </div>
            <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#10AFA5]" />
          </button>
        ))}
      </div>
    </section>
  );
};

export default TrendingServicesSection;
