import React from 'react';
import { motion } from 'framer-motion';
import brandConfig from '../../config/brandConfig';

/**
 * LogoLoader Component - Refactored for smooth native-app-like loading
 * @param {boolean} fullScreen - If true with overlay=true, shows initial app boot loader.
 *                               If false, shows a clean page-level centered spinner.
 * @param {boolean} overlay - If true, uses solid white background (initial boot).
 * @param {boolean} inline - If true, renders a tiny spinner for buttons.
 * @param {string} size - Size override for inline or page loader.
 */
const LogoLoader = ({ fullScreen = false, overlay = false, inline = false, size = "" }) => {
  // Brand color for the spinners
  const brandColor = '#347989';

  // 1. INLINE MODE (Buttons & small containers)
  if (inline) {
    const defaultSize = size || "w-5 h-5";
    return (
      <div className="flex items-center justify-center">
        <svg 
          className={`animate-spin ${defaultSize}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // 2. PAGE LEVEL MODE (Transitions & Content Loading)
  if (!fullScreen || (fullScreen && !overlay)) {
    const defaultSize = size || "w-10 h-10";
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[30vh]">
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Pulse */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#347989]/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Premium Spinner */}
          <svg 
            className={`animate-spin ${defaultSize} text-[#347989] z-10`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // 3. INITIAL APP BOOT MODE (Full screen overlay with beautiful minimal logo presentation)
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 relative flex items-center justify-center mb-6">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#347989]/10 to-[#D68F35]/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <img fetchPriority="low" loading="lazy"             src={brandConfig.logoPath}
            alt={brandConfig.brandName}
            className="w-16 h-16 object-contain relative z-10"
          />
        </div>
        
        {/* Subtle linear loader at bottom of logo */}
        <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#347989] to-[#0D8A72]"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.2, 
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LogoLoader;
