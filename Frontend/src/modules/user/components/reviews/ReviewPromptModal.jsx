import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const ReviewPromptModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/users/reviews', {
        bookingId: booking._id,
        serviceId: booking.serviceId?._id || booking.serviceId,
        vendorId: booking.vendorId?._id || booking.vendorId,
        workerId: booking.workerId?._id || booking.workerId,
        rating,
        review: reviewText
      });

      if (response.data?.success) {
        toast.success('Review submitted successfully! It is pending approval.');
        if (onSuccess) onSuccess(response.data.review);
        onClose();
        // Reset state
        setRating(0);
        setReviewText('');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-black text-gray-900">Rate your experience</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {booking.serviceId?.title || 'Service Completed'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3">How was the service?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <FiStar
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="h-4 mt-2">
                {rating > 0 && (
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Write a review (Optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us what you liked or what could be better..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full bg-[#2874f0] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewPromptModal;
