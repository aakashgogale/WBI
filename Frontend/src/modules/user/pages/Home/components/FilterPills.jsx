import React, { useState } from 'react';
import { FiCheck, FiBookmark, FiUser, FiTag } from 'react-icons/fi';
import { themeColors } from '../../../../../theme';

const filters = [
  { id: 'all', label: 'All', icon: FiCheck },
  { id: 'booked', label: 'Booked', icon: FiBookmark },
  { id: 'electricians', label: 'Electricians', icon: FiUser },
  { id: 'agents', label: 'Agents', icon: FiTag },
];

const FilterPills = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="w-full overflow-x-auto scrollbar-hide px-4 py-2 mt-2 mb-2">
      <div className="flex items-center gap-3 w-max">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-300 shadow-sm ${
                isActive 
                  ? 'bg-[#FF8A00] text-white shadow-[#FF8A00]/30' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? 'bg-white' : 'bg-transparent'}`}>
                <Icon className={`w-3 h-3 ${isActive ? 'text-[#FF8A00]' : 'text-gray-400'}`} strokeWidth={isActive ? 3 : 2} />
              </div>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPills;
