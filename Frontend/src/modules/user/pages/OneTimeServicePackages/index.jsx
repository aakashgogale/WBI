import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiX, FiInfo } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const OneTimeServicePackages = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const brandId = searchParams.get('brandId');
  const issueIds = searchParams.get('issueIds');

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [brand, setBrand] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedIssuesList, setSelectedIssuesList] = useState([]);
  
  const [showDetails, setShowDetails] = useState(false);
  
  // Track selected package IDs
  const [selectedPackages, setSelectedPackages] = useState([]);
  
  const [pricePreview, setPricePreview] = useState({
    subtotal: 0,
    platformFee: 0,
    gst: 0,
    totalAmount: 0,
    itemCount: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug, brandId, issueIds]);

  // When selectedPackages changes, fetch price preview
  useEffect(() => {
    if (selectedPackages.length > 0) {
      fetchPricePreview(selectedPackages);
    } else {
      setPricePreview({
        subtotal: 0,
        platformFee: 0,
        gst: 0,
        totalAmount: 0,
        itemCount: 0
      });
    }
  }, [selectedPackages]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch service details
      const svcRes = await api.get(`/users/one-time-services/${slug}`);
      if (!svcRes.data.success) throw new Error('Service not found');
      
      const srv = svcRes.data.data;
      setService(srv);
      
      // 2. Fetch brand details if brandId is present
      if (brandId) {
        const brandsRes = await api.get(`/users/one-time-services/${srv._id}/brands`);
        if (brandsRes.data.success) {
          const selectedBr = brandsRes.data.data.find(b => b._id === brandId);
          if (selectedBr) setBrand(selectedBr);
        }
      }

      // 3. Fetch packages
      let url = `/users/one-time-services/${srv._id}/packages?`;
      if (brandId) url += `brandId=${brandId}&`;
      if (issueIds) url += `issueIds=${issueIds}`;

      const pkgRes = await api.get(url);
      if (pkgRes.data.success) {
        const fetchedPackages = pkgRes.data.data;
        setPackages(fetchedPackages);
        
        // Pre-select required packages
        const requiredIds = fetchedPackages.filter(p => p.isRequired).map(p => p._id);
        setSelectedPackages(requiredIds);
      }

      // 4. Fetch selected issues names
      if (issueIds) {
        const issuesRes = await api.get(`/users/one-time-services/${srv._id}/issues`);
        if (issuesRes.data.success) {
          const idsArray = issueIds.split(',');
          const filteredIssues = issuesRes.data.data.filter(i => idsArray.includes(i._id));
          setSelectedIssuesList(filteredIssues);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricePreview = async (pkgIds) => {
    try {
      // Create a map of quantities (default 1 for all checked)
      const quantities = {};
      pkgIds.forEach(id => {
        quantities[id] = 1;
      });

      const res = await api.post('/users/one-time-services/price-preview', {
        packageIds: pkgIds,
        quantities
      });
      
      if (res.data.success) {
        setPricePreview(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching price preview:', error);
    }
  };

  const togglePackage = (pkg) => {
    if (pkg.isRequired) {
      toast.error('This package is required and cannot be removed.');
      return;
    }

    setSelectedPackages(prev => {
      if (prev.includes(pkg._id)) {
        return prev.filter(id => id !== pkg._id);
      } else {
        return [...prev, pkg._id];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one package');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const quantities = {};
      selectedPackages.forEach(id => quantities[id] = 1);

      const payload = {
        serviceId: service._id,
        brandId: brandId || null,
        issueIds: issueIds ? issueIds.split(',') : [],
        packageIds: selectedPackages,
        quantities,
        priceSnapshot: pricePreview
      };

      const res = await api.post('/users/one-time-bookings/draft', payload);
      
      if (res.data.success) {
        // Navigate to the next step, Address & Schedule page
        navigate(`/user/one-time-checkout?draftId=${res.data.data._id}`);
      } else {
        toast.error(res.data.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#10AFA5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FCFC] min-h-screen pb-56">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#F8FCFC]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        </div>
        
        {/* Selected Brand Info */}
        {brand && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Selected Brand</span>
            <div className="flex items-center gap-2 mt-0.5">
              {brand.logo ? (
                <img fetchPriority="low" loading="lazy" src={brand.logo} alt={brand.brandName} className="h-4 object-contain" />
              ) : null}
              <span className="text-sm font-bold text-gray-800">{brand.brandName}</span>
            </div>
          </div>
        )}
      </header>

      <div className="px-5 pt-4">
        {/* Title */}
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-1">3. Add Services (Optional)</h2>
        <p className="text-[13px] text-[#64748B] mb-4">Add additional services if required</p>

        {/* Selected Issues Banner */}
        {selectedIssuesList.length > 0 && (
          <div className="bg-[#F1FAF9] border border-[#10AFA5]/20 rounded-xl p-3 mb-6 flex gap-3 items-start">
            <FiInfo className="w-5 h-5 text-[#10AFA5] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-[#10AFA5] mb-0.5">Reported Issue(s)</p>
              <p className="text-[13px] text-[#0F172A] font-medium leading-snug">
                {selectedIssuesList.map(i => i.title).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Packages List */}
        <div className="flex flex-col gap-3">
          {packages.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center border border-gray-100">
              <p className="text-gray-500 text-sm">No specific packages found for your selection.</p>
            </div>
          ) : (
            packages.map(pkg => {
              const isSelected = selectedPackages.includes(pkg._id);
              
              return (
                <div 
                  key={pkg._id} 
                  onClick={() => togglePackage(pkg)}
                  className={`bg-white p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                    isSelected ? 'border-[#10AFA5] shadow-sm' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Checkbox UI */}
                  <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                    isSelected ? 'bg-[#10AFA5] border-[#10AFA5]' : 'border-gray-300'
                  } ${pkg.isRequired ? 'opacity-70' : ''}`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[14.5px] font-bold text-[#0F172A] leading-tight">{pkg.name}</h3>
                      {pkg.isRequired && (
                        <span className="bg-[#FFFBEB] text-[#D97706] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Required</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#64748B] leading-snug line-clamp-2">
                      {pkg.description || 'Standard service'}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold text-[#0F172A]">₹{pkg.price}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Extra spacer to ensure smooth scrolling above the sticky card */}
        <div className="h-16"></div>
      </div>

      {/* Sticky Price Summary */}
      {selectedPackages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-3xl z-20 max-w-[480px] mx-auto p-5 pb-8">
          
          {/* Price Breakdown */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-[16px] font-bold text-[#0F172A]">Price Summary</h4>
              <p className="text-[12px] text-[#64748B] mt-0.5">{pricePreview.itemCount} items selected</p>
              
              <button 
                onClick={() => setShowDetails(true)}
                className="text-[12px] font-bold text-[#10AFA5] mt-1 hover:underline"
              >
                View Details
              </button>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-[#0F172A]">₹{pricePreview.totalAmount}</p>
            </div>
          </div>
          
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-[15px] text-white shadow-lg shadow-[#10AFA5]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#10AFA5] hover:bg-[#0E9D94]'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      )}

      {/* View Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-8 transition-opacity">
          <div className="bg-white w-full max-w-[440px] rounded-3xl p-6 shadow-2xl animate-slide-up relative">
            <button 
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>
            
            <h3 className="text-[18px] font-bold text-[#0F172A] mb-6">Payment Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#64748B]">Item Total</span>
                <span className="font-semibold text-[#0F172A]">₹{pricePreview.subtotal}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#64748B]">Platform Fee</span>
                <span className="font-semibold text-[#0F172A]">₹{pricePreview.platformFee}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#64748B]">Taxes & Fees (GST 18%)</span>
                <span className="font-semibold text-[#0F172A]">₹{pricePreview.gst}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-[16px] font-bold border-t border-gray-100 pt-4 mb-6">
              <span className="text-[#0F172A]">Amount to Pay</span>
              <span className="text-[#10AFA5]">₹{pricePreview.totalAmount}</span>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] bg-[#10AFA5] text-white shadow-lg shadow-[#10AFA5]/25 active:scale-[0.98] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneTimeServicePackages;
