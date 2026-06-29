import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiStar, FiMapPin, FiCheckCircle, FiTool, FiBriefcase, FiClock, FiChevronRight, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../services/api';

const WorkerSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: 0,
    availability: 'any'
  });
  
  // Extract query params
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category');
  const subServiceId = queryParams.get('subServiceId');
  const serviceName = queryParams.get('serviceName') || 'Service';

  useEffect(() => {
    fetchMatchingWorkers();
  }, [category, subServiceId]);

  const fetchMatchingWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/public/workers/match', {
        params: {
          category,
          subServiceId
        }
      });
      if (res.data && res.data.success) {
        setWorkers(res.data.workers || []);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (worker) => {
    // Navigate to booking flow or specific enquiry form passing worker ID
    navigate(`/user/booking-confirmation/new?workerId=${worker._id}&subServiceId=${subServiceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex flex-col pt-16 px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl p-5 mb-4 animate-pulse shadow-sm">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC] pb-24 font-sans text-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F8FCFC]/90 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold truncate px-2">Select Expert</h1>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <FiFilter className="w-4 h-4 text-gray-600" />
        </button>
      </header>

      {/* Title Area */}
      <div className="px-5 py-6">
        <h2 className="text-2xl font-black mb-1">Available Experts</h2>
        <p className="text-sm text-gray-500">Matching specialists for <span className="font-semibold text-black">{serviceName}</span></p>
      </div>

      {/* Workers List */}
      <div className="px-4 space-y-4">
        <AnimatePresence>
          {workers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-[24px] p-8 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm mt-8"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiBriefcase className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Experts Found</h3>
              <p className="text-sm text-gray-500">We couldn't find available experts for this specific service right now. Please try again later.</p>
            </motion.div>
          ) : (
            workers.map((worker, idx) => (
              <motion.div
                key={worker._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group"
              >
                {/* Verification Badge */}
                {worker.verifiedBadge && (
                  <div className="absolute top-0 right-0 bg-[#10AFA5] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <FiShield className="w-3 h-3" /> VERIFIED
                  </div>
                )}

                <div className="flex gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-md">
                      {worker.profilePic ? (
                        <img fetchPriority="low" loading="lazy" src={worker.profilePic} alt={worker.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-xl font-black">
                          {worker.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Online Status Dot */}
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                      {worker.name}
                      <FiCheckCircle className="w-4 h-4 text-[#10AFA5]" />
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                        <FiStar className="w-3.5 h-3.5 fill-current" />
                        {worker.rating || '4.8'}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <FiBriefcase className="w-3.5 h-3.5" />
                        {worker.completedJobs || 0} jobs
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500 font-medium">
                      <FiMapPin className="w-3 h-3 text-[#10AFA5]" />
                      {worker.address?.city || 'Local Area'} ({worker.address?.pincode || 'Nearby'})
                    </div>
                  </div>
                </div>

                {/* Sub-service context */}
                {worker.subServices && worker.subServices.find(s => s.subServiceId === subServiceId) && (() => {
                  const subData = worker.subServices.find(s => s.subServiceId === subServiceId);
                  return (
                    <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Expertise</div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {subData.brandsHandled?.slice(0, 3).map(b => (
                          <span key={b} className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                            {b}
                          </span>
                        ))}
                        {subData.skills?.slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] font-semibold bg-white text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium border-t border-gray-200/50 pt-2 mt-2">
                        <FiClock className="w-3.5 h-3.5" /> 
                        Experience: <span className="text-black font-bold">{subData.experienceLevel || `${subData.yearsOfExperience} Years`}</span>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  onClick={() => handleBookNow(worker)}
                  className="w-full bg-[#10AFA5] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0C8F87] transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
                >
                  Book Expert <FiChevronRight />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkerSelection;
