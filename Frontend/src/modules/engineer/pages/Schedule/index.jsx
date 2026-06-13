import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';

const Schedule = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-slate-800 pb-20">
      <Header title="My Schedule" onBack={() => navigate('/engineer/dashboard')} />
      
      <main className="p-5">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FaCalendarCheck className="text-blue-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Events</h2>
          <p className="text-slate-500 text-sm max-w-[250px] mb-6">
            Your schedule is clear. Check back later for upcoming jobs or projects.
          </p>
          <button 
            onClick={() => navigate('/engineer/jobs')}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
          >
            Find Work
          </button>
        </div>
      </main>
    </div>
  );
};

export default Schedule;
