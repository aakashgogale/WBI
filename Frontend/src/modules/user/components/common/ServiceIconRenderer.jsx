import React from 'react';
import { TbTool } from 'react-icons/tb';
import { 
  MdAcUnit, 
  MdOutlineLocalLaundryService, 
  MdOutlineWaterDrop,
  MdOutlineHotTub,
  MdOutlineCleaningServices,
  MdOutlinePlumbing,
  MdOutlineElectricalServices,
  MdOutlineMicrowave
} from 'react-icons/md';
import { FiMonitor } from 'react-icons/fi';

export const ServiceIconRenderer = ({ categoryName, className = "" }) => {
  if (!categoryName) return <TbTool className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  
  const normalized = categoryName.toLowerCase().trim();

  // Map categories to high-quality react-icons
  if (normalized.includes('ac')) {
    return <MdAcUnit className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('washing')) {
    return <MdOutlineLocalLaundryService className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('geyser')) {
    return <MdOutlineHotTub className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('ro') || normalized.includes('purifier')) {
    return <MdOutlineWaterDrop className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('cleaning')) {
    return <MdOutlineCleaningServices className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('plumb')) {
    return <MdOutlinePlumbing className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('electric') || normalized.includes('wire')) {
    return <MdOutlineElectricalServices className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('microwave') || normalized.includes('oven')) {
    return <MdOutlineMicrowave className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }
  if (normalized.includes('tv') || normalized.includes('led') || normalized.includes('television')) {
    return <FiMonitor className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
  }

  // Fallback icon
  return <TbTool className={`w-7 h-7 text-[#10AFA5] ${className}`} />;
};

export default ServiceIconRenderer;
