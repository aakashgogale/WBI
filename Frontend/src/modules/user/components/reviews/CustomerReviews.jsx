import React, { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { themeColors } from '../../../../theme';
import api from '../../../../services/api'; // Or standard axios if needed

const CustomerReviews = ({ serviceId = 'all' }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const brandColor = themeColors?.brand?.teal || '#23b0a7';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // We use 'all' for system-wide generic reviews on the homepage
        const response = await api.get(`/public/reviews/service/${serviceId}?limit=3`);
        if (response.data?.success) {
          setReviews(response.data.data);
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="py-2 px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[280px] h-[160px] bg-gray-100 rounded-2xl animate-pulse flex-shrink-0"></div>
          <div className="min-w-[280px] h-[160px] bg-gray-100 rounded-2xl animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return null; // Don't show the section if there are no approved reviews yet
  }

  const { averageRating, totalReviews, star5, star4, star3, star2, star1 } = stats;
  
  // Format numbers (e.g. 12500 -> 12.5K)
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const starData = [
    { label: 5, percent: getPercentage(star5) },
    { label: 4, percent: getPercentage(star4) },
    { label: 3, percent: getPercentage(star3) },
    { label: 2, percent: getPercentage(star2) },
    { label: 1, percent: getPercentage(star1) },
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-[14px] h-[14px] ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <section className="py-2 px-4 mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Customer Reviews</h2>
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

      <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 scrollbar-hide snap-x">
        
        {/* Aggregates Card */}
        <div className="min-w-[280px] w-[280px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 snap-center">
          {/* Left: Overall Rating */}
          <div className="flex flex-col items-center justify-center min-w-[85px]">
            <span className="text-[36px] font-black text-[#0F172A] leading-none mb-1">
              {averageRating?.toFixed(1)}
            </span>
            <div className="mb-1">
              {renderStars(averageRating)}
            </div>
            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
              ({formatNumber(totalReviews)} Reviews)
            </span>
          </div>

          {/* Right: Progress Bars */}
          <div className="flex-1 flex flex-col justify-center gap-[6px]">
            {starData.map((star) => (
              <div key={star.label} className="flex items-center gap-1.5 text-[10px]">
                <span className="font-bold text-gray-700 w-3">{star.label}</span>
                <FiStar className="w-[10px] h-[10px] text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${star.percent}%`, backgroundColor: brandColor }}
                  ></div>
                </div>
                <span className="text-gray-400 w-5 text-right">{star.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Review Cards */}
        {reviews.map((review) => (
          <div 
            key={review._id} 
            className="min-w-[260px] w-[260px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 snap-center flex flex-col"
          >
            {/* User Info Header */}
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={review.userId?.profilePhoto || `https://i.pravatar.cc/150?u=${review.userId?._id || review._id}`} 
                alt={review.userId?.name || 'Customer'} 
                className="w-10 h-10 rounded-full object-cover bg-slate-100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${review.userId?.name || 'User'}&background=random`;
                }}
              />
              
              <div className="flex-1">
                <h4 className="text-[13px] font-bold text-gray-900 leading-tight">
                  {review.userId?.name || 'Happy Customer'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {timeAgo(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Stars */}
            <div className="mb-2">
              {renderStars(review.rating)}
            </div>

            {/* Review Text */}
            <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3">
              {review.review || 'No written feedback provided.'}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};

export default CustomerReviews;
