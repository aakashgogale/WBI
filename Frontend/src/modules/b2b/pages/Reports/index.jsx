import React from 'react';
import { FiPieChart, FiTrendingUp, FiActivity, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Reports = () => {
  const handleExport = (reportName) => {
    toast.success(`Exporting ${reportName} to CSV...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-[#F0FDFA] text-[#10AFA5] rounded-xl flex items-center justify-center shrink-0">
            <FiTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Corporate Spending</span>
            <h4 className="text-xl font-black text-gray-800 mt-0.5">₹1,12,500</h4>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <FiActivity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed dispatches</span>
            <h4 className="text-xl font-black text-gray-800 mt-0.5">98 Jobs</h4>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <FiPieChart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active branch locations</span>
            <h4 className="text-xl font-black text-gray-800 mt-0.5">4 Active</h4>
          </div>
        </div>
      </div>

      {/* Analytics Lists */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="border-b border-gray-50 pb-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Generate Analytical Reports</h3>
        </div>

        <div className="space-y-3.5">
          {[
            { name: 'Monthly Spending Breakdown', desc: 'Detailed cost metrics per branch and service category.', key: 'spend' },
            { name: 'Branch Job Performance', desc: 'Response times, worker ratings, and completed milestones.', key: 'performance' },
            { name: 'Audit Compliance logs', desc: 'Electrical safety and HVAC preventive maintenance certifications.', key: 'compliance' }
          ].map((report) => (
            <div key={report.key} className="border border-gray-50 rounded-2xl p-4 flex justify-between items-center gap-4 hover:bg-gray-50/30 transition-colors">
              <div>
                <h4 className="text-xs font-bold text-gray-800">{report.name}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{report.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleExport(report.name)}
                className="bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Reports;
