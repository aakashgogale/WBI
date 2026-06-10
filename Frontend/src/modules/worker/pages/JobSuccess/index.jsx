import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoLocationOutline, IoTimeOutline, IoCalendarOutline, IoWalletOutline, IoDocumentTextOutline, IoShareSocialOutline, IoDownloadOutline, IoStarOutline, IoStarHalfOutline, IoStar } from 'react-icons/io5';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

// Simple CSS Confetti Component
const Confetti = () => {
  const pieces = Array.from({ length: 30 });
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = `${Math.random() * 100}%`;
        const animationDuration = `${Math.random() * 2 + 1}s`;
        const animationDelay = `${Math.random() * 0.5}s`;

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: color, left }}
            initial={{ top: '-10%', opacity: 1, rotate: 0 }}
            animate={{
              top: '110%',
              opacity: [1, 1, 0],
              rotate: 360,
              x: Math.random() * 100 - 50
            }}
            transition={{
              duration: parseFloat(animationDuration),
              delay: parseFloat(animationDelay),
              ease: "linear"
            }}
          />
        );
      })}
    </div>
  );
};

const JobSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [completionRes, walletRes] = await Promise.all([
        api.get(`/api/workers/jobs/${id}/completion`),
        api.get(`/api/workers/wallet/summary`)
      ]);

      if (completionRes.data.success) {
        setData(completionRes.data.data);
      }
      if (walletRes.data.success) {
        setWallet(walletRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching success data:', error);
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const res = await api.post(`/api/workers/jobs/${id}/share`);
      const { shareText } = res.data.data;

      if (navigator.share) {
        await navigator.share({
          title: 'Job Completed',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Report text copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share report.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10AFA5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">Could not load completion details.</p>
        <button onClick={() => navigate('/worker/jobs')} className="px-6 py-3 bg-[#10AFA5] text-white rounded-xl font-medium w-full max-w-xs">
          Back to Jobs
        </button>
      </div>
    );
  }

  const { booking, earnedAmount, duration } = data;
  const addressStr = booking?.address ? `${booking.address.addressLine1}, ${booking.address.city}` : 'N/A';

  // Stars for rating logic
  const renderStars = () => {
    if (!booking.rating) {
      return (
        <div className="flex items-center space-x-2 text-gray-400">
          <IoTimeOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Waiting for Rating</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IoStar key={star} className={`w-5 h-5 ${star <= booking.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{booking.rating}/5</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#10AFA5]  relative overflow-x-hidden font-sans">
      <Confetti />
      
      {/* SUCCESS HEADER */}
      <div className="pt-16 pb-10 px-6 text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <IoCheckmarkCircle className="w-16 h-16 text-[#10B981]" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Job Completed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/90 font-medium"
        >
          You have successfully completed the assigned job.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="px-4 space-y-4 relative z-10"
      >
        {/* JOB SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <h3 className="font-bold text-gray-900 text-lg">{booking?.serviceName || booking?.serviceId?.title}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1 mb-4">
            <IoLocationOutline className="w-4 h-4 mr-1" />
            <span className="truncate">{addressStr}</span>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center"><IoCalendarOutline className="w-3 h-3 mr-1"/>Completed On</p>
              <p className="font-semibold text-gray-800 text-sm">
                {new Date(booking.completedAt || new Date()).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500 flex items-center mt-0.5"><IoTimeOutline className="w-3 h-3 mr-1"/>
                {new Date(booking.completedAt || new Date()).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Earning</p>
              <p className="font-bold text-xl text-[#10AFA5]">₹{earnedAmount}</p>
            </div>
          </div>
        </div>

        {/* EARNINGS SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center"><IoWalletOutline className="w-5 h-5 mr-2 text-[#10AFA5]"/> Wallet & Earnings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Wallet Balance</p>
              <p className="font-bold text-gray-900 text-lg mt-1">₹{wallet?.walletBalance || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Pending Payouts</p>
              <p className="font-bold text-orange-500 text-lg mt-1">₹{wallet?.pendingPayouts || 0}</p>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 border border-teal-100">
              <p className="text-xs text-teal-700 font-medium">Total Monthly Earnings</p>
              <p className="font-bold text-teal-800 text-xl mt-1">₹{wallet?.totalMonthlyEarnings || 0}</p>
            </div>
          </div>
        </div>

        {/* WORK SUMMARY SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center"><IoDocumentTextOutline className="w-5 h-5 mr-2 text-[#10AFA5]"/> Work Summary</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-2 border-b border-gray-50">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">{duration}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-50">
              <span className="text-gray-500">Materials Used</span>
              <span className="font-medium text-gray-900">{booking.materials?.length || 0} Items</span>
            </div>
            {booking.workerNotes && (
              <div className="pt-2">
                <span className="text-gray-500 block mb-1">Notes Added:</span>
                <p className="text-gray-800 bg-gray-50 p-2 rounded-lg text-xs">{booking.workerNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* RATING STATUS SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <h4 className="font-bold text-gray-900 mb-3">Customer Rating</h4>
          <div className="flex items-center justify-between">
            {renderStars()}
            {booking.review && (
              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium">Feedback Received</span>
            )}
          </div>
        </div>

        {/* COMPLETION REPORT SECTION */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button 
            onClick={() => navigate(`/worker/job/${id}/report`)}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <IoDocumentTextOutline className="w-6 h-6 mb-1 text-[#10AFA5]"/>
            <span className="text-xs font-medium">View Report</span>
          </button>
          <button 
            onClick={handleShare}
            disabled={sharing}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 transition"
          >
            {sharing ? (
               <div className="w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full animate-spin mb-1"></div>
            ) : (
              <IoShareSocialOutline className="w-6 h-6 mb-1 text-[#10AFA5]"/>
            )}
            <span className="text-xs font-medium">{sharing ? 'Sharing...' : 'Share Report'}</span>
          </button>
        </div>

        {/* NEXT ACTIONS */}
        <div className="space-y-3 pt-4">
          <button 
            onClick={() => navigate('/worker/jobs')}
            className="w-full bg-white text-[#10AFA5] font-bold text-lg py-4 rounded-xl shadow-lg transition hover:bg-gray-50 flex items-center justify-center"
          >
            Back to Jobs
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/worker/wallet')}
              className="bg-teal-800/30 backdrop-blur-sm text-white font-medium py-3 rounded-xl border border-white/20 hover:bg-teal-800/40 transition"
            >
              View Wallet
            </button>
            <button 
              onClick={() => navigate('/worker/jobs?status=completed')}
              className="bg-teal-800/30 backdrop-blur-sm text-white font-medium py-3 rounded-xl border border-white/20 hover:bg-teal-800/40 transition"
            >
              Completed Jobs
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default JobSuccess;
