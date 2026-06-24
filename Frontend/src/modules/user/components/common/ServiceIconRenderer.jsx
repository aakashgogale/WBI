import React from 'react';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import AirVent from 'lucide-react/dist/esm/icons/air-vent';
import Microwave from 'lucide-react/dist/esm/icons/microwave';
import Refrigerator from 'lucide-react/dist/esm/icons/refrigerator';
import Waves from 'lucide-react/dist/esm/icons/waves';
import Droplets from 'lucide-react/dist/esm/icons/droplets';
import Thermometer from 'lucide-react/dist/esm/icons/thermometer';
import Camera from 'lucide-react/dist/esm/icons/camera';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Cog from 'lucide-react/dist/esm/icons/cog';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import FireExtinguisher from 'lucide-react/dist/esm/icons/fire-extinguisher';
import Tv from 'lucide-react/dist/esm/icons/tv';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

export const ServiceIconRenderer = ({ categoryName, className = "w-[32px] h-[32px]" }) => {
  if (!categoryName) return <Wrench className={className} strokeWidth={1.5} />;
  
  const normalized = categoryName.toLowerCase().trim();

  // Primary 3D Icons8 Illustrations
  if (normalized.includes('ac') || normalized.includes('conditioner')) return <img src="https://img.icons8.com/fluency/96/air-conditioner.png" className={className} style={{ objectFit: 'contain' }} alt="AC" />;
  if (normalized.includes('microwave') || normalized.includes('oven')) return <img src="https://img.icons8.com/fluency/96/microwave.png" className={className} style={{ objectFit: 'contain' }} alt="Microwave" />;
  if (normalized.includes('refrigerator') || normalized.includes('fridge')) return <img src="https://img.icons8.com/fluency/96/refrigerator.png" className={className} style={{ objectFit: 'contain' }} alt="Refrigerator" />;
  if (normalized.includes('washing')) return <img src="https://img.icons8.com/fluency/96/washing-machine.png" className={className} style={{ objectFit: 'contain' }} alt="Washing Machine" />;
  if (/\bro\b/.test(normalized) || normalized.includes('purifier') || normalized.includes('water')) return <img src="https://img.icons8.com/fluency/96/water-cooler.png" className={className} style={{ objectFit: 'contain' }} alt="RO" />;
  if (normalized.includes('geyser') || normalized.includes('heater')) return <img src="https://img.icons8.com/fluency/96/water-heater.png" className={className} style={{ objectFit: 'contain' }} alt="Geyser" />;
  if (normalized.includes('cctv') || normalized.includes('camera')) return <img src="https://img.icons8.com/fluency/96/dome-camera.png" className={className} style={{ objectFit: 'contain' }} alt="CCTV" />;
  if (normalized.includes('security') || normalized.includes('surveillance')) return <img src="https://img.icons8.com/fluency/96/security-checked.png" className={className} style={{ objectFit: 'contain' }} alt="Security" />;
  if (normalized.includes('electric') || normalized.includes('wire')) return <img src="https://img.icons8.com/fluency/96/plug.png" className={className} style={{ objectFit: 'contain' }} alt="Electrician" />;
  if (normalized.includes('plumb')) return <img src="https://img.icons8.com/fluency/96/plumbing.png" className={className} style={{ objectFit: 'contain' }} alt="Plumber" />;
  if (normalized.includes('atm')) return <img src="https://img.icons8.com/fluency/96/atm.png" className={className} style={{ objectFit: 'contain' }} alt="ATM" />;
  if (normalized.includes('bank')) return <img src="https://img.icons8.com/fluency/96/bank-cards.png" className={className} style={{ objectFit: 'contain' }} alt="Bank" />;
  if (normalized.includes('health') || normalized.includes('medical')) return <img src="https://img.icons8.com/fluency/96/health-checkup.png" className={className} style={{ objectFit: 'contain' }} alt="Healthcare" />;
  if (normalized.includes('fire') || normalized.includes('safety')) return <img src="https://img.icons8.com/fluency/96/fire-extinguisher.png" className={className} style={{ objectFit: 'contain' }} alt="Fire Safety" />;

  // Secondary Lucide React Line Icons
  if (normalized.includes('appliance') || normalized.includes('repair')) return <Cog className={className} strokeWidth={1.5} />;
  if (normalized.includes('tv') || normalized.includes('led') || normalized.includes('television')) return <Tv className={className} strokeWidth={1.5} />;
  if (normalized.includes('cleaning')) return <Sparkles className={className} strokeWidth={1.5} />;

  // Default fallback
  return <Wrench className={className} strokeWidth={1.5} />;
};

export default ServiceIconRenderer;
