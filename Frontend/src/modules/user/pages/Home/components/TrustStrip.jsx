import React from 'react';
import { FiUsers, FiDollarSign, FiShield, FiClock } from 'react-icons/fi';

const TrustStrip = () => {
  const trustFeatures = [
    {
      icon: <FiUsers className="text-[#10AFA5] text-xl" />,
      title: "Verified Experts",
      subtitle: "Trusted professionals"
    },
    {
      icon: <FiDollarSign className="text-[#10AFA5] text-xl" />,
      title: "Upfront Pricing",
      subtitle: "No hidden charges"
    },
    {
      icon: <FiShield className="text-[#10AFA5] text-xl" />,
      title: "Service Warranty",
      subtitle: "Assured support"
    },
    {
      icon: <FiClock className="text-[#10AFA5] text-xl" />,
      title: "Fast & Reliable",
      subtitle: "On-time service"
    }
  ];

  return (
    <div className="mx-4 my-6 bg-white rounded-[24px] shadow-[0_4px_24px_rgba(16,175,165,0.06)] border border-[#E5F3F2] p-4 flex items-center justify-between">
      {trustFeatures.map((feature, index) => (
        <div key={index} className="flex flex-col items-center justify-center text-center w-1/4 px-1">
          <div className="w-10 h-10 rounded-full bg-[#F8FCFC] flex items-center justify-center mb-2">
            {feature.icon}
          </div>
          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#0F172A] leading-tight mb-0.5">
            {feature.title}
          </h4>
          <p className="text-[8px] sm:text-[9px] font-medium text-[#64748B] leading-tight">
            {feature.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrustStrip;
