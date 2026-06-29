import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiNavigation, FiClock, FiMapPin } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../../services/api';
import { useSocket } from '../../../../../context/SocketContext';

const LiveTrackingModal = ({ jobId, onClose }) => {
  const socket = useSocket();
  const [liveData, setLiveData] = useState(null);

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['b2bJobLive', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await api.get(`/b2b/jobs/live/${jobId}`);
      return res.data?.data;
    },
    enabled: !!jobId
  });

  useEffect(() => {
    if (initialData) {
      setLiveData(initialData);
    }
  }, [initialData]);

  // Listen for realtime coordinate updates
  useEffect(() => {
    if (!socket || !jobId) return;
    
    const handleLocationUpdate = (data) => {
      if (data.jobId === jobId) {
        setLiveData(prev => ({
          ...prev,
          eta: data.eta || prev.eta,
          distance: data.distance || prev.distance,
          engineerLocation: data.location || prev.engineerLocation
        }));
      }
    };

    socket.on('engineer_location_update', handleLocationUpdate);
    return () => socket.off('engineer_location_update', handleLocationUpdate);
  }, [socket, jobId]);

  if (!jobId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiNavigation className="text-[#10AFA5]" /> Live Tracking
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Tracking Job: {jobId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-gray-100 relative min-h-[350px]">
            {/* 
              In a real application, you would render <GoogleMap> here.
              For this implementation, we simulate the map view to avoid API key dependencies.
            */}
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=13&size=800x400&sensor=false')] bg-cover bg-center opacity-50" />
            
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="animate-spin w-8 h-8 border-2 border-[#10AFA5] border-t-transparent rounded-full" />
              </div>
            ) : liveData ? (
              <>
                {/* Mock Marker for Destination */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                  <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">
                    Destination
                  </div>
                  <FiMapPin className="w-8 h-8 text-red-500 drop-shadow-md" />
                </div>

                {/* Mock Marker for Engineer */}
                <motion.div 
                  className="absolute z-10 flex flex-col items-center"
                  animate={{ 
                    top: ['60%', '55%', '50%'], 
                    left: ['40%', '45%', '50%'] 
                  }}
                  transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                >
                  <div className="bg-[#10AFA5] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">
                    Engineer
                  </div>
                  <div className="w-6 h-6 bg-[#10AFA5] rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <p className="text-gray-500 font-medium text-sm">Tracking data unavailable.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {liveData && (
            <div className="bg-white p-5 border-t border-gray-100 flex items-center justify-around">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                  <FiClock className="text-[#10AFA5]" /> Estimated Time
                </p>
                <p className="text-xl font-black text-gray-900">{liveData.eta}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                  <FiNavigation className="text-[#10AFA5]" /> Distance
                </p>
                <p className="text-xl font-black text-gray-900">{liveData.distance}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LiveTrackingModal;
