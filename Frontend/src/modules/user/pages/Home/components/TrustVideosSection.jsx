import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { MdStar } from 'react-icons/md';
import api from '../../../../../services/api';

// Realistic fallbacks
import intenseBathroom2Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-2.jpg';
import automaticTopLoadImage from '../../../../../assets/images/pages/Home/MostBookedServices/automatic-top-load-machine.webp';
import tapRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/tap-repai.jpg';

const TrustVideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/public/trust-videos');
        if (response.data?.success && response.data?.videos?.length > 0) {
          setVideos(response.data.videos);
        } else {
          // Fallback to reference image data if DB is empty
          setVideos([
            {
              _id: 'v1',
              title: 'AC Repair Done in 45 Minutes',
              rating: '4.8',
              duration: '0:45',
              thumbnail: intenseBathroom2Image,
              videoType: 'url',
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
            },
            {
              _id: 'v2',
              title: 'Washing Machine Service Experience',
              rating: '4.7',
              duration: '0:32',
              thumbnail: automaticTopLoadImage,
              videoType: 'url',
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
            },
            {
              _id: 'v3',
              title: 'Geyser Repair at Home',
              rating: '4.8',
              duration: '0:40',
              thumbnail: tapRepairImage,
              videoType: 'url',
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching trust videos:', error);
        // Fallback to reference image data if error
        setVideos([
          {
            _id: 'v1',
            title: 'AC Repair Done in 45 Minutes',
            rating: '4.8',
            duration: '0:45',
            thumbnail: intenseBathroom2Image,
            videoType: 'url',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            _id: 'v2',
            title: 'Washing Machine Service Experience',
            rating: '4.7',
            duration: '0:32',
            thumbnail: automaticTopLoadImage,
            videoType: 'url',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            _id: 'v3',
            title: 'Geyser Repair at Home',
            rating: '4.8',
            duration: '0:40',
            thumbnail: tapRepairImage,
            videoType: 'url',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDragStart = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;
    slider.isDown = true;
    slider.startX = e.pageX - slider.offsetLeft;
    slider.scrollLeftInit = slider.scrollLeft;
  };

  const handleDragEnd = () => {
    const slider = scrollRef.current;
    if (!slider) return;
    slider.isDown = false;
  };

  const handleDragMove = (e) => {
    const slider = scrollRef.current;
    if (!slider || !slider.isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - slider.startX) * 2; // Scroll-fast factor
    slider.scrollLeft = slider.scrollLeftInit - walk;
  };

  if (loading) return null;

  return (
    <div className="mb-6 px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
          Real service experiences
        </h2>
        <button className="text-[14px] font-medium text-[#10AFA5] hover:opacity-80 transition-opacity">
          See All
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-3.5 pb-4 -mx-4 px-4 snap-x snap-mandatory custom-scrollbar"
        onMouseDown={handleDragStart}
        onMouseLeave={handleDragEnd}
        onMouseUp={handleDragEnd}
        onMouseMove={handleDragMove}
        style={{ cursor: 'grab' }}
      >
        {videos.map((video) => (
          <motion.div
            key={video._id}
            className="flex-shrink-0 w-[156px] sm:w-[170px] snap-center relative group cursor-pointer"
            onClick={() => setActiveVideo(video)}
          >
            {/* Image Container */}
            <div className="relative w-full h-[96px] sm:h-[106px] rounded-[12px] overflow-hidden mb-2 shadow-[0_4px_16px_rgba(15,23,42,0.04)] bg-[#f8fafc]">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark Overlay for better button visibility */}
              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-[#0F172A] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-[1px] rounded-[4px]">
                {video.duration || '0:45'}
              </div>
            </div>

            {/* Content info below image */}
            <div className="pr-2">
              <h3 className="text-[#0F172A] font-bold text-[13px] leading-[1.3] mb-1.5 min-h-[34px] line-clamp-2">
                {video.title}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#64748B]">
                <MdStar className="text-[#F59E0B] w-3.5 h-3.5" /> 
                <span className="mt-[1px]">{video.rating || '4.8'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Bottom Sheet / Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center sm:p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] bg-[#1A1A1A] sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                 <div className="flex items-center bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                   <FiCheckCircle className="text-green-400 mr-1.5" />
                   <span className="text-white text-xs font-semibold">Real Experience</span>
                 </div>
                 <button 
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"
                 >
                   <FiX size={18} />
                 </button>
              </div>

              {/* Player */}
              <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden h-full">
                {activeVideo.videoType === 'youtube' ? (
                  <iframe
                    src={activeVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&mute=0&loop=1&rel=0&controls=0'}
                    title={activeVideo.title}
                    className="w-full h-full sm:h-[60vh] object-cover sm:object-contain scale-[1.3] sm:scale-100"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    muted={activeVideo.isMuted}
                    playsInline
                    className="w-full h-full object-cover sm:object-contain"
                    poster={activeVideo.thumbnail}
                  />
                )}
              </div>

              {/* Info Sheet Overlay (at bottom of video) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-white font-bold text-lg leading-tight flex-1">
                    {activeVideo.title}
                  </h3>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="flex items-center gap-1 text-sm font-bold text-white mb-1">
                      <FiStar className="text-yellow-400 fill-yellow-400" /> {activeVideo.rating}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Customer Rating</span>
                  </div>
                </div>
                
                {activeVideo.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {activeVideo.description}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <span className="text-gray-400 text-xs">Service:</span>
                  <span className="text-white font-semibold text-sm">
                    {activeVideo.serviceCategory}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrustVideosSection;
