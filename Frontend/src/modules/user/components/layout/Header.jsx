import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiChevronDown } from 'react-icons/hi';
import { FiBell, FiShoppingCart, FiBookmark } from 'react-icons/fi';
import { gsap } from 'gsap';
import LocationSelector from '../common/LocationSelector';
import { animateLogo } from '../../../../utils/gsapAnimations';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import CitySelectorModal from '../common/CitySelectorModal';

const Header = ({ location, onLocationClick }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 100) setHidden(true);
    else setHidden(false);
  });

  const logoRef = useRef(null);
  const { currentCity } = useCity();
  const { cartCount } = useCart();
  const [isCityModalOpen, setIsCityModalOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (logoRef.current) {
      animateLogo(logoRef.current);
    }
  }, []);

  return (
    <motion.header className="relative bg-transparent pt-3 pb-2 sticky top-0 z-50 bg-white/90 backdrop-blur-md"
      variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}>
      <div className="px-4 flex items-center justify-between mt-2 mb-2">
        {/* Left: Logo */}
        <Link to="/user/account" className="cursor-pointer shrink-0 flex items-center">
          <img fetchPriority="low" loading="lazy" 
            src="/logo/WBILogo.jpg" 
            alt="WBI Logo" 
            className="h-[46px] w-[46px] md:w-auto object-cover object-left md:object-contain" 
          />
        </Link>
        
        {/* Center/Right: Location Pill */}
        <div 
          className="flex-1 ml-auto mr-3 max-w-[190px] flex items-center bg-white border border-[#E5F3F2] rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(16,175,165,0.04)] cursor-pointer group" 
          onClick={onLocationClick}
        >
          <HiLocationMarker className="text-[#10AFA5] w-4 h-4 mr-1.5 shrink-0" />
          <span className="text-[12px] font-bold text-[#0F172A] truncate flex-1 leading-tight">
            {location && location !== '...' 
              ? location.split(',').slice(0, 2).join(', ').trim() 
              : 'Select Location'}
          </span>
          <HiChevronDown className="w-4 h-4 text-[#64748B] shrink-0 ml-1 group-hover:translate-y-0.5 transition-transform" />
        </div>

        {/* Right: Notifications */}
        <button 
          onClick={() => navigate('/user/notifications')}
          className="relative w-9 h-9 flex items-center justify-center shrink-0"
        >
          <FiBell className="w-[22px] h-[22px] text-[#0F172A]" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full border-[1.5px] border-[#F8FCFC]"></span>
        </button>
      </div>

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </motion.header>
  );
};

export default Header;
