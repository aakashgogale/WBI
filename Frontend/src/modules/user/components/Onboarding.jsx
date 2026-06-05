import React, { useState, useRef } from 'react';
import { themeColors } from '../../../theme';

// --- Component Data ---

const onboardingData = [
  { id: 1, image: '/img/Doorstep.png' },
  { id: 2, image: '/img/Technicians.png' },
  { id: 3, image: '/img/EasyBooking.png' }
];

// --- Main Component ---

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const brandColor = themeColors?.brand?.teal || '#23b0a7'; // Homestr teal

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentStep < onboardingData.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
    if (isRightSwipe && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    try {
      localStorage.setItem('onboardingCompleted_v4', 'true');
    } catch (error) {
      console.warn('Could not save onboarding status to localStorage', error);
    }
    
    // Add a quick fade out animation before calling onComplete
    const container = document.getElementById('onboarding-container');
    if (container) {
      container.style.opacity = '0';
      setTimeout(onComplete, 300);
    } else {
      onComplete();
    }
  };

  // Safe reset for dev mode ONLY
  const [devClicks, setDevClicks] = useState(0);
  const handleDevReset = () => {
    setDevClicks(prev => prev + 1);
    if (devClicks > 3) {
      try {
        localStorage.removeItem('onboardingCompleted_v4');
        localStorage.removeItem('onboardingCompleted_v3');
        localStorage.removeItem('onboardingCompleted_v2');
        localStorage.removeItem('onboardingCompleted');
      } catch(e) {}
      setCurrentStep(0);
      setDevClicks(0);
      alert('Onboarding status reset for testing.');
    }
  };

  return (
    <div 
      id="onboarding-container"
      className="relative w-full bg-white overflow-hidden transition-opacity duration-300"
      style={{ minHeight: '100dvh' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Layer - Covers entire screen, pushes boundaries out to hide borders if possible */}
      <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
        {onboardingData.map((step, index) => {
          const isActive = index === currentStep;
          return (
            <img
              key={step.id}
              src={step.image}
              alt={`Onboarding ${step.id}`}
              loading={index === 0 ? "eager" : "lazy"}
              // Using scale-105 to push the thin border off the screen and make it look native
              className={`absolute top-0 w-full h-full object-cover object-top sm:object-contain scale-[1.02] transform transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          );
        })}
      </div>

      {/* Top Cover / Skip Button */}
      {/* Solid white background at top right to OVERLAY and hide the baked-in "Skip" button in the image */}
      <div className="absolute top-0 right-0 z-30 pt-[max(env(safe-area-inset-top),20px)] pr-6 pl-12 pb-4 bg-gradient-to-bl from-white via-white to-transparent rounded-bl-3xl">
        <button
          onClick={finishOnboarding}
          className="px-6 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          style={{ color: brandColor }}
        >
          Skip
        </button>
      </div>

      {/* Bottom Cover / Action Area */}
      {/* Solid white background spanning the bottom to OVERLAY and hide the baked-in dots & button */}
      <div 
        className="absolute bottom-0 w-full px-6 z-30 flex flex-col items-center justify-end"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
          paddingTop: '32px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 30%, white 50%, white 100%)' 
        }}
      >
        {/* Hidden clickable area for DEV reset */}
        <div onClick={handleDevReset} className="w-full h-10 absolute bottom-0 left-0 opacity-0 z-50" />

        {/* Real Pagination Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {onboardingData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                currentStep === index ? 'w-8' : 'w-2.5 bg-gray-200 hover:bg-gray-300'
              }`}
              style={{ backgroundColor: currentStep === index ? brandColor : undefined }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Real Primary Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-[16px] px-6 rounded-2xl text-white font-bold text-lg active:scale-[0.98] transition-transform flex items-center justify-center shadow-md hover:shadow-lg"
          style={{ backgroundColor: brandColor }}
        >
          {currentStep === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
