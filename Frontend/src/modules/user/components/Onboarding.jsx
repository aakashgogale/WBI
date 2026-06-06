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
      localStorage.setItem('onboardingCompleted_v5', 'true');
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
        localStorage.removeItem('onboardingCompleted_v5');
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
      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center pointer-events-none">
        {onboardingData.map((step, index) => {
          const isActive = index === currentStep;
          return (
            <img
              key={step.id}
              src={step.image}
              alt={`Onboarding ${step.id}`}
              loading={index === 0 ? "eager" : "lazy"}
              className={`absolute top-0 left-0 w-full h-full object-fill transform transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          );
        })}
      </div>

      {/* Invisible Click Area for "Skip" (Top Right corner) */}
      <div 
        onClick={finishOnboarding}
        className="absolute top-0 right-0 w-32 h-32 z-50 cursor-pointer"
        aria-label="Skip"
      />

      {/* Invisible Click Area for "Next" (Bottom portion of screen) */}
      <div 
        onClick={handleNext}
        className="absolute bottom-0 left-0 w-full h-1/2 z-40 cursor-pointer flex items-end justify-center pb-2"
        aria-label="Next"
      >
        {/* Hidden clickable area for DEV reset placed securely out of the way */}
        <div onClick={(e) => { e.stopPropagation(); handleDevReset(); }} className="w-full h-4 absolute bottom-0 left-0 opacity-0 z-50" />
      </div>
    </div>
  );
};

export default Onboarding;
