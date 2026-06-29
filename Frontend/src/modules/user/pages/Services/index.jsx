import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { FiSearch, FiSliders, FiChevronRight, FiAlertCircle, FiHeadphones, FiMonitor, FiShield, FiBriefcase, FiZap, FiHeart, FiSettings, FiCpu, FiGrid } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import { publicCatalogService } from '../../../../services/catalogService';
import { OptimizedImage } from '../../../../components/common';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://app.wbinfs.com').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const defaultCategories = [
  { id: 'digital', title: 'Digital Solutions', description: 'IT services, computer repair, networking & more', iconName: 'FiMonitor', slug: 'digital-solutions' },
  { id: 'security', title: 'Security Solutions', description: 'CCTV installation, access control, security systems', iconName: 'FiShield', slug: 'security-solutions' },
  { id: 'banking', title: 'Banking Solutions', description: 'ATM installation, maintenance, cash handling', iconName: 'FiBriefcase', slug: 'banking-solutions' },
  { id: 'energy', title: 'Energy Solutions', description: 'Solar installation, power backup, energy audit', iconName: 'FiZap', slug: 'energy-solutions' },
  { id: 'healthcare', title: 'Healthcare Solutions', description: 'Medical equipment, maintenance, support', iconName: 'FiHeart', slug: 'healthcare-solutions' },
  { id: 'appliance', title: 'Appliance Solutions', description: 'Home appliance repair, installation & service', iconName: 'FiSettings', slug: 'appliance-solutions' },
  { id: 'automation', title: 'Automation Solutions', description: 'Smart home, industrial automation, IoT', iconName: 'FiCpu', slug: 'automation-solutions' },
  { id: 'fire', title: 'Fire and Safety', description: 'Fire extinguisher, alarm systems, safety audits', iconName: 'FiAlertCircle', slug: 'fire-and-safety' }
];

const Services = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from new isolated premium backend
      const response = await publicCatalogService.getServiceCategories();
      
      if (response.success && response.categories && response.categories.length > 0) {
        const mapped = response.categories.map((cat) => ({
          id: cat._id,
          title: cat.name,
          description: cat.description || 'Professional service for your needs',
          iconUrl: cat.image, // Admin might upload image or SVG
          iconName: cat.icon, // Fallback for hardcoded string icons like 'FiMonitor'
          slug: cat.slug
        }));
        setServices(mapped);
      } else {
        // If DB is completely empty (not seeded yet), show the default 8 categories
        setServices(defaultCategories);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices(defaultCategories); // Gracefully degrade if API crashes
    } finally {
      // Small delay to show off the beautiful skeleton loader
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchCategories();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search query to prevent excessive re-renders while typing
  useDebounce(
    () => {
      setDebouncedSearch(searchQuery);
    },
    300,
    [searchQuery]
  );

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    service.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const [visibleCount, setVisibleCount] = useState(20);

  // Simple infinite chunking to prevent huge DOM tree
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleCount(prev => prev + 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayedServices = filteredServices.slice(0, visibleCount);

  return (
    <div className="bg-[#F8FCFC] relative overflow-x-hidden pb-0 mb-0">
      <Header />

      <div className="px-4 mt-4 pb-0 mb-0">
        {/* Search Bar matching mockup exactly */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center mb-6"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search for AC service and repair..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white h-14 pl-12 pr-16 rounded-[20px] text-[15px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]/30 transition-all placeholder:text-gray-400"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#10AFA5] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(16,175,165,0.3)] active:scale-95 transition-transform">
            <FiSliders className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Page Title */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">All Services</h1>
          <p className="text-[13px] text-[#64748B] mt-1">Professional services for your home and business</p>
        </motion.div>

        {/* Dynamic Content Area */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-full mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-8">
            <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-red-800 mb-1">Failed to load services</h3>
            <p className="text-sm text-red-600 mb-4">We encountered a problem while fetching the services.</p>
            <button 
              onClick={() => fetchCategories()}
              className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-full text-sm active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center mb-8">
            <FiGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-1">No services found</h3>
            <p className="text-sm text-gray-500">We couldn't find any services matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {displayedServices.map((service, index) => {
              // Map string icon names to actual React icons if no image is provided
              let IconComponent = FiGrid;
              if (service.iconName === 'FiMonitor') IconComponent = FiMonitor;
              if (service.iconName === 'FiShield') IconComponent = FiShield;
              if (service.iconName === 'FiBriefcase') IconComponent = FiBriefcase;
              if (service.iconName === 'FiZap') IconComponent = FiZap;
              if (service.iconName === 'FiHeart') IconComponent = FiHeart;
              if (service.iconName === 'FiSettings') IconComponent = FiSettings;
              if (service.iconName === 'FiCpu') IconComponent = FiCpu;
              if (service.iconName === 'FiAlertCircle') IconComponent = FiAlertCircle;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(service.slug ? `/user/categories/${service.slug}` : '#')}
                  className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col relative group cursor-pointer"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-[#10AFA5]/10 flex items-center justify-center mb-4 text-[#10AFA5] group-hover:bg-[#10AFA5] group-hover:text-white transition-colors duration-300 overflow-hidden">
                    {service.iconUrl ? (
                      <OptimizedImage src={toAssetUrl(service.iconUrl)} alt={service.title} className="w-full h-full object-contain filter group-hover:brightness-0 group-hover:invert transition-all duration-300 p-2" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-[14px] font-bold text-[#0F172A] leading-tight mb-1.5 pr-4 tracking-tight">{service.title}</h3>
                  <p className="text-[11px] text-[#64748B] leading-[1.5] line-clamp-2">{service.description}</p>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#10AFA5] transition-colors">
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Support Banner exactly like mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-0 bg-gradient-to-br from-[#E8F8F7] to-[#F1FAF9] rounded-2xl p-5 relative overflow-hidden border border-[#10AFA5]/10 shadow-sm"
        >
          {/* Background decorative elements */}
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#10AFA5]/5 rounded-full blur-2xl -mr-10 -mb-10"></div>
          
          <div className="relative z-10 w-2/3">
            <h3 className="text-[15px] font-bold text-[#0F172A] mb-1.5 leading-tight">Need Help Choosing a Service?</h3>
            <p className="text-[11px] text-[#64748B] mb-4 leading-relaxed">
              Our experts are here to help you find the right solution
            </p>
            <button 
              className="bg-[#10AFA5] text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-[0_4px_10px_rgba(16,175,165,0.25)]"
              onClick={() => navigate('/user/help-support')}
            >
              <FiHeadphones className="w-4 h-4" />
              Contact Support
            </button>
          </div>
          
          {/* Illustration/Image mock - absolute positioned to the right */}
          <div className="absolute right-[-10px] bottom-0 w-1/3 h-[110%] flex items-end">
            <div className="relative w-full h-full">
              {/* Floating chat bubbles like the mockup */}
              <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute right-6 top-4 w-6 h-6 bg-[#10AFA5] rounded-xl rounded-br-sm flex items-center justify-center opacity-90"
              >
                <div className="w-3 h-0.5 bg-white rounded-full"></div>
              </motion.div>
              <motion.div 
                animate={{ y: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute right-2 top-14 w-8 h-8 bg-[#0F172A] rounded-xl rounded-tl-sm flex items-center justify-center opacity-90"
              >
                <div className="flex flex-col gap-1 items-center">
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  <div className="w-2 h-0.5 bg-white rounded-full mr-2"></div>
                </div>
              </motion.div>
              
              {/* Professional image */}
              <img fetchPriority="low" loading="lazy" 
                src="https://res.cloudinary.com/dcbcojo24/image/upload/v1731518018/uploads/x69wz81p8t08er78ssli.png" // using a reliable transparent mechanic/professional image
                alt="Support Expert" 
                className="absolute bottom-0 right-0 w-[120px] object-contain drop-shadow-md z-10"
                style={{ objectPosition: 'bottom' }}
                onError={(e) => {
                  e.target.style.display = 'none'; // Graceful degradation if image fails
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
