import React from 'react';
import { FiSearch, FiSliders } from 'react-icons/fi';

const SearchBar = ({ onInputClick }) => {
  return (
    <div className="w-full relative cursor-pointer px-4 mt-2 mb-0" onClick={onInputClick}>
      <div className="w-full flex items-center bg-white border border-[#E5F3F2] rounded-full h-[56px] pl-5 pr-2 shadow-[0_4px_20px_rgba(16,175,165,0.05)] transition-transform active:scale-[0.98]">
        <FiSearch className="w-5 h-5 text-[#64748B] mr-3 shrink-0" strokeWidth={2} />
        <div className="text-[14px] text-[#64748B] font-medium truncate flex-1">
          Search for <span className="text-[#F59E0B] font-bold">AC service</span> and repair...
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-[#10AFA5] flex items-center justify-center shrink-0 shadow-sm">
          <FiSearch className="w-[20px] h-[20px] text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
