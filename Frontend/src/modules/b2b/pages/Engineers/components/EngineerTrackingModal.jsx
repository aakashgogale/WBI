import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiNavigation, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../../services/api';
import { useSocket } from '../../../../../context/SocketContext';

const EngineerTrackingModal = ({ engineerId, onClose }) => {
  const socket = useSocket();
  const [liveLocation, setLiveLocation] = useState(null);

  const { data: engData, isLoading } = useQuery({
    queryKey: ['b2bEngineerLive', engineerId],
    queryFn: async () => {
      if (!engineerId) return null;
      const res = await api.get(`/b2b/engineers/${engineerId}`);
      return res.data?.data;
    },
    enabled: !!engineerId
  });

  useEffect(() => {
    if (engData?.location) {
      setLiveLocation(engData.location);
    }
  }, [engData]);

  // Listen for realtime coordinate updates
  useEffect(() => {
    if (!socket || !engineerId) return;
    
    const handleLocationUpdate = (data) => {
      if (data.engineerId === engineerId && data.location) {
        setLiveLocation({ lat: data.location.lat, lng: data.location.lng });
      }
    };

    socket.on('b2b:engineerLocationUpdated', handleLocationUpdate);
    return () => socket.off('b2b:engineerLocationUpdated', handleLocationUpdate);
  }, [socket, engineerId]);

  if (!engineerId) return null;

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
              {engData && <p className="text-xs font-semibold text-gray-500 mt-0.5">Tracking Engineer: {engData.name}</p>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-gray-100 relative min-h-[400px]">
            {/* 
              In a real application, you would render <GoogleMap> or <MapContainer> (Leaflet) here.
              For this UI implementation, we simulate the map view to avoid API key dependencies.
            */}
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=13&size=800x400&sensor=false')] bg-cover bg-center opacity-50" />
            
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="animate-spin w-8 h-8 border-2 border-[#10AFA5] border-t-transparent rounded-full" />
              </div>
            ) : liveLocation ? (
              <>
                {/* Mock Marker for Engineer */}
                <motion.div 
                  className="absolute z-10 flex flex-col items-center"
                  animate={{ 
                    top: ['60%', '55%', '50%', '55%'], 
                    left: ['40%', '45%', '50%', '45%'] 
                  }}
                  transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
                >
                  <div className="bg-[#10AFA5] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap flex items-center gap-1">
                    <img src={engData.profilePhoto || 'https://via.placeholder.com/20'} className="w-4 h-4 rounded-full" alt="Eng" />
                    {engData.name}
                  </div>
                  <div className="w-6 h-6 bg-[#10AFA5] rounded-full border-2 border-white shadow-md flex items-center justify-center relative">
                    <div className="w-full h-full bg-[#10AFA5] rounded-full animate-ping absolute opacity-50" />
                    <FiUser className="text-white w-3 h-3" />
                  </div>
                </motion.div>
                
                {engData.currentJob && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">
                      Job: {engData.currentJob.jobId}
                    </div>
                    <FiMapPin className="w-8 h-8 text-red-500 drop-shadow-md" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <p className="text-gray-500 font-medium text-sm">Location tracking is currently unavailable for this engineer.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {engData?.currentJob && (
            <div className="bg-white p-4 border-t border-gray-100 flex items-center justify-around">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold mb-1">Destination</p>
                <p className="text-sm font-bold text-gray-900">{engData.currentJob.city}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold mb-1">Current Job Status</p>
                <p className={`text-sm font-bold capitalize ${engData.currentJob.status === 'in_progress' ? 'text-blue-500' : 'text-[#10AFA5]'}`}>
                  {engData.currentJob.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EngineerTrackingModal;
