import React, { useState } from 'react';
import { FiMap, FiNavigation, FiClock, FiActivity, FiUsers, FiChevronRight } from 'react-icons/fi';

const LiveTracking = () => {
  const [activeTracking, setActiveTracking] = useState('all');

  const trackingTeams = [
    { id: 'TRK-2948', worker: 'Ramesh Kumar', task: 'HVAC Servicing', branch: 'Hyderabad Warehouse', location: 'Section B, Row 4', status: 'On-Site', elapsed: '1h 15m' },
    { id: 'TRK-2910', worker: 'Suresh Patil', task: 'Electrical Panel Maintenance', branch: 'Pune Depot', location: 'En Route (5 mins away)', status: 'Traveling', elapsed: '25m' },
    { id: 'TRK-2850', worker: 'Amit Sharma', task: 'ATM Cleaning', branch: 'Indore Main Branch', location: 'Finished tasks', status: 'Completed', elapsed: '45m' }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Simulator */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-4">
            <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Live GPS Radar simulation</h3>
            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
          </div>

          {/* Simulated Map Graphic Container */}
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-teal-50 to-[#E6F4F2] border border-[#E6F4F2] relative overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            {/* Grid Line Simulators */}
            <div className="absolute inset-0 bg-[radial-gradient(#10AFA5_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            
            {/* Center target circle */}
            <div className="absolute h-48 w-48 rounded-full border border-[#10AFA5]/20 flex items-center justify-center animate-pulse">
              <div className="h-24 w-24 rounded-full border border-[#10AFA5]/30"></div>
            </div>

            {/* GPS Markers on Map */}
            <div className="absolute top-1/4 left-1/3 flex flex-col items-center gap-1.5 animate-bounce">
              <FiNavigation className="text-[#10AFA5] w-6 h-6 fill-current rotate-45" />
              <span className="bg-white border border-[#E6F4F2] text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm text-gray-700">Ramesh K (HVAC)</span>
            </div>

            <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center gap-1.5">
              <FiNavigation className="text-orange-500 w-6 h-6 fill-current rotate-12" />
              <span className="bg-white border border-[#E6F4F2] text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm text-gray-700">Suresh P (Electrical)</span>
            </div>

            <div className="z-10 bg-white/95 backdrop-blur border border-[#E6F4F2] px-6 py-4 rounded-2xl max-w-sm shadow-xl">
              <FiMap className="w-8 h-8 text-[#10AFA5] mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-800">Skilled teams matched and tracked</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Live maps display check-in times and coordinates once teams arrive at warehouse addresses.
              </p>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-gray-400 font-bold flex gap-4 items-center">
            <span>Radar Range: 15km</span>
            <span>Refresh rate: 10s</span>
          </div>
        </div>

        {/* Live List sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FiActivity className="text-[#10AFA5] w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Active Trackers</h3>
          </div>

          <div className="space-y-3">
            {trackingTeams.map((team) => (
              <div 
                key={team.id}
                className="border border-gray-50 hover:border-[#10AFA5]/25 rounded-2xl p-4 bg-gray-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400">{team.id}</span>
                    <p className="text-xs font-bold text-gray-800">{team.worker}</p>
                    <p className="text-[10px] text-[#10AFA5] font-bold mt-0.5">{team.task}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    team.status === 'On-Site' 
                      ? 'bg-green-100 text-green-700' 
                      : team.status === 'Traveling'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {team.status}
                  </span>
                </div>

                <div className="border-t border-gray-100/50 pt-2 flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <div className="flex items-center gap-1">
                    <FiClock />
                    Time: {team.elapsed}
                  </div>
                  <span className="text-[10px] text-gray-400">{team.branch}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

export default LiveTracking;
