import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiHeart, FiClock } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const OneTimeServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [brands, setBrands] = useState([]);
  const [issues, setIssues] = useState([]);
  
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]);
  
  const [estimate, setEstimate] = useState({ startingPrice: 0, estimatedTime: '--' });
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchServiceData();
  }, [slug]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      // Fetch service details
      const svcRes = await api.get(`/users/one-time-services/${slug}`);
      if (svcRes.data.success) {
        setService(svcRes.data.data);
        // Check if we should skip this page entirely
        if (!svcRes.data.data.isBrandRequired && !svcRes.data.data.isIssueRequired) {
          navigate(`/user/service/${slug}/packages`, { replace: true });
          return;
        }

        const srvId = svcRes.data.data._id;
        
        // Fetch brands
        if (svcRes.data.data.isBrandRequired) {
          const brRes = await api.get(`/users/one-time-services/${srvId}/brands`);
          if (brRes.data.success) setBrands(brRes.data.data);
        }
        
        // Fetch initial issues (no brand selected, or brand not required)
        if (svcRes.data.data.isIssueRequired && !svcRes.data.data.isBrandRequired) {
          fetchIssues(srvId, null);
        }
        
        fetchEstimate(srvId, null, []);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (serviceId, brandId) => {
    try {
      const url = brandId 
        ? `/users/one-time-services/${serviceId}/issues?brandId=${brandId}`
        : `/users/one-time-services/${serviceId}/issues`;
      const res = await api.get(url);
      if (res.data.success) setIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchEstimate = async (serviceId, brandId, selectedIssueIds) => {
    try {
      let url = `/users/one-time-services/${serviceId}/estimate?`;
      if (brandId) url += `brandId=${brandId}&`;
      if (selectedIssueIds.length > 0) url += `issueIds=${selectedIssueIds.join(',')}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        const { startingPrice, estimatedDurationMins } = res.data.data;
        setEstimate({
          startingPrice,
          estimatedTime: estimatedDurationMins ? `${estimatedDurationMins} mins` : '--'
        });
      }
    } catch (error) {
      console.error('Error fetching estimate:', error);
    }
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    // Reset issues selection when brand changes
    setSelectedIssues([]);
    if (service) {
      fetchIssues(service._id, brand._id);
      fetchEstimate(service._id, brand._id, []);
    }
  };

  const handleIssueSelect = (issue) => {
    let newSelection = [...selectedIssues];
    
    if (issue.allowMultiple) {
      if (newSelection.includes(issue._id)) {
        newSelection = newSelection.filter(id => id !== issue._id);
      } else {
        newSelection.push(issue._id);
      }
    } else {
      // If single select, replace selection
      newSelection = [issue._id];
    }
    
    setSelectedIssues(newSelection);
    if (service) {
      fetchEstimate(service._id, selectedBrand?._id, newSelection);
    }
  };

  const handleContinue = () => {
    if (service.isBrandRequired && !selectedBrand) {
      toast.error('Please select a brand');
      return;
    }
    if (service.isIssueRequired && selectedIssues.length === 0) {
      toast.error('Please select at least one issue');
      return;
    }
    
    const brandParam = selectedBrand ? `brandId=${selectedBrand._id}&` : '';
    const issueIdsParam = selectedIssues.length > 0 ? `issueIds=${selectedIssues.join(',')}` : '';
    
    navigate(`/user/service/${slug}/packages?${brandParam}${issueIdsParam}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#10AFA5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Service not found</p>
        <button onClick={() => navigate(-1)} className="text-[#10AFA5] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-28">
      {/* Header Area */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100"
        >
          <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-[#10AFA5] text-[#10AFA5]' : 'text-gray-800'}`} />
        </button>
      </header>

      <div className="px-5">
        {/* Service Hero */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">{service.name}</h1>
            <p className="text-[13px] text-[#64748B] leading-relaxed mb-2">
              {service.subtitle || 'Professional service at your doorstep'}
            </p>
            <div className="flex items-center gap-1 bg-[#F1FAF9] w-max px-2 py-1 rounded-md">
              <span className="text-[#10AFA5] text-sm">★</span>
              <span className="text-sm font-bold text-[#10AFA5]">{service.rating || '4.8'}</span>
              <span className="text-xs text-[#10AFA5]">({service.totalReviews > 1000 ? (service.totalReviews/1000).toFixed(1)+'K+' : service.totalReviews})</span>
            </div>
          </div>
          <div className="w-[100px] h-[75px] rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
            {service.image ? (
              <img fetchPriority="low" loading="lazy" src={service.image} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-300 text-xs text-center px-2">No Image</div>
            )}
          </div>
        </div>

        {/* 1. Select Brand */}
        {service.isBrandRequired && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[#0F172A]">1. Select Brand</h2>
            <button className="text-[12px] font-semibold text-[#10AFA5]">View all</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {brands.map(brand => {
              const isSelected = selectedBrand?._id === brand._id;
              return (
                <button
                  key={brand._id}
                  onClick={() => handleBrandSelect(brand)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-[#10AFA5] bg-[#F1FAF9] shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                  style={{ height: '70px' }}
                >
                  {brand.logo ? (
                    <img fetchPriority="low" loading="lazy" src={brand.logo} alt={brand.brandName} className="h-6 object-contain mb-1" />
                  ) : (
                    <span className={`text-[12px] font-bold ${isSelected ? 'text-[#10AFA5]' : 'text-gray-700'}`}>
                      {brand.brandName}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Other Brand Option */}
            <button
              onClick={() => handleBrandSelect({ _id: 'other', brandName: 'Others' })}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                selectedBrand?._id === 'other'
                  ? 'border-[#10AFA5] bg-[#F1FAF9] shadow-sm' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
              style={{ height: '70px' }}
            >
              <span className={`text-[12px] font-bold ${selectedBrand?._id === 'other' ? 'text-[#10AFA5]' : 'text-gray-700'}`}>
                Others
              </span>
            </button>
          </div>
        </div>
        )}

        {/* 2. What's the issue? */}
        {service.isIssueRequired && (
        <div className="mb-6">
          <h2 className="text-[15px] font-bold text-[#0F172A] mb-1">
            {service.isBrandRequired ? "2. What's the issue?" : "1. What's the issue?"}
          </h2>
          <p className="text-[11px] text-[#64748B] mb-3">Select one or more problems</p>
          
          {(!service.isBrandRequired || selectedBrand) ? (
            <div className="flex flex-wrap gap-2">
              {issues.map(issue => {
                const isSelected = selectedIssues.includes(issue._id);
                return (
                  <button
                    key={issue._id}
                    onClick={() => handleIssueSelect(issue)}
                    className={`px-4 py-2 rounded-full border text-[13px] transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-[#10AFA5] bg-[#F1FAF9] text-[#10AFA5] font-semibold'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#10AFA5] bg-[#10AFA5]' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    {issue.title}
                  </button>
                );
              })}
              
              {/* Other Issue Option */}
              <button
                onClick={() => handleIssueSelect({ _id: 'other', title: 'Others (specify)', allowMultiple: true })}
                className={`px-4 py-2 rounded-full border text-[13px] transition-all flex items-center gap-2 ${
                  selectedIssues.includes('other')
                    ? 'border-[#10AFA5] bg-[#F1FAF9] text-[#10AFA5] font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedIssues.includes('other') ? 'border-[#10AFA5] bg-[#10AFA5]' : 'border-gray-300'
                }`}>
                  {selectedIssues.includes('other') && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                Others (specify)
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">Please select a brand first</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Bottom Action Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pt-4 pb-6 z-20 max-w-[480px] mx-auto">
        <div className="flex items-center justify-between bg-[#F8FCFC] p-3 rounded-xl border border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <FiClock className="text-[#64748B] w-4 h-4" />
            <div>
              <p className="text-[10px] text-[#64748B]">Estimated Time</p>
              <p className="text-[13px] font-bold text-[#0F172A]">{estimate.estimatedTime}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#64748B]">Starts from</p>
            <p className="text-[16px] font-bold text-[#0F172A]">₹{estimate.startingPrice}</p>
          </div>
        </div>
        
        <button
          onClick={handleContinue}
          disabled={!((!service.isBrandRequired || selectedBrand) && (!service.isIssueRequired || selectedIssues.length > 0))}
          className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
            (!service.isBrandRequired || selectedBrand) && (!service.isIssueRequired || selectedIssues.length > 0)
              ? 'bg-[#10AFA5] text-white shadow-lg shadow-[#10AFA5]/20 active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OneTimeServiceDetail;
