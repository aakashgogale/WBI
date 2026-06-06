import React from 'react';

export const ServiceIconRenderer = ({ categoryName, className = "" }) => {
  const getIconUrl = (name) => {
    if (!name) return 'https://img.icons8.com/color/96/maintenance.png';
    
    const normalized = name.toLowerCase().trim();

    // Map categories to high-quality 3D-style color icons
    if (normalized.includes('ac') || normalized.includes('conditioner')) {
      return 'https://img.icons8.com/color/96/air-conditioner.png';
    }
    if (normalized.includes('washing')) {
      return 'https://img.icons8.com/color/96/washing-machine.png';
    }
    if (normalized.includes('geyser') || normalized.includes('heater')) {
      return 'https://img.icons8.com/color/96/water-heater.png';
    }
    if (normalized.includes('ro') || normalized.includes('purifier') || normalized.includes('water')) {
      return 'https://img.icons8.com/color/96/water-dispenser.png';
    }
    if (normalized.includes('cleaning')) {
      return 'https://img.icons8.com/color/96/broom.png';
    }
    if (normalized.includes('plumb')) {
      return 'https://img.icons8.com/color/96/plumbing.png';
    }
    if (normalized.includes('electric') || normalized.includes('wire')) {
      return 'https://img.icons8.com/color/96/electrical.png';
    }
    if (normalized.includes('microwave') || normalized.includes('oven')) {
      return 'https://img.icons8.com/color/96/microwave.png';
    }
    if (normalized.includes('tv') || normalized.includes('led') || normalized.includes('television')) {
      return 'https://img.icons8.com/color/96/tv.png';
    }
    if (normalized.includes('atm') || normalized.includes('surveillance')) {
      return 'https://img.icons8.com/color/96/atm.png';
    }

    // Fallback icon
    return 'https://img.icons8.com/color/96/maintenance.png';
  };

  const iconUrl = getIconUrl(categoryName);

  return (
    <img 
      src={iconUrl} 
      alt={categoryName || 'Service Icon'} 
      className={`w-8 h-8 object-contain drop-shadow-sm ${className}`}
      onError={(e) => {
        // Fallback to a generic tool icon if the specific one fails
        e.target.src = 'https://img.icons8.com/color/96/maintenance.png';
      }}
    />
  );
};

export default ServiceIconRenderer;
