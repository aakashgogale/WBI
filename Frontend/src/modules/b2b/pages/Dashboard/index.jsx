import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiHome, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, 
  FiCreditCard, FiCalendar, FiPlus, FiArrowUpRight, FiArrowDownRight,
  FiLoader, FiAlertCircle
} from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

// Helper to format date keys
const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper component for pure SVG Area Chart
const SvgAreaChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-xs text-center py-10 font-bold">No data available</div>;
  }
  
  const keys = ['Completed', 'In Progress', 'Pending'];
  let maxVal = 10;
  data.forEach(item => {
    keys.forEach(k => {
      if (item[k] > maxVal) maxVal = item[k];
    });
  });
  maxVal = Math.ceil(maxVal * 1.15);
  
  const width = 500;
  const height = 240;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const getX = (index) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (value) => height - paddingBottom - (value / maxVal) * chartHeight;
  
  const getPaths = (key) => {
    let linePath = '';
    let areaPath = '';
    data.forEach((item, index) => {
      const x = getX(index);
      const y = getY(item[key] || 0);
      if (index === 0) {
        linePath = `M ${x} ${y}`;
        areaPath = `M ${x} ${height - paddingBottom} L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }
      if (index === data.length - 1) {
        areaPath += ` L ${x} ${height - paddingBottom} Z`;
      }
    });
    return { linePath, areaPath };
  };
  
  const compPaths = getPaths('Completed');
  const progPaths = getPaths('In Progress');
  const pendPaths = getPaths('Pending');
  
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));
  
  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="svgColorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10AFA5" stopOpacity={0.25}/>
            <stop offset="100%" stopColor="#10AFA5" stopOpacity={0.0}/>
          </linearGradient>
          <linearGradient id="svgColorInProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25}/>
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0}/>
          </linearGradient>
          <linearGradient id="svgColorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25}/>
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        
        {yTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#F3F4F6" strokeWidth={1} strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="text-[9px] font-bold fill-gray-400">{tick}</text>
            </g>
          );
        })}
        
        {data.map((item, i) => {
          if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
          const x = getX(i);
          return (
            <g key={i}>
              <text x={x} y={height - 10} textAnchor="middle" className="text-[9px] font-bold fill-gray-400">{item.date}</text>
            </g>
          );
        })}
        
        <path d={pendPaths.areaPath} fill="url(#svgColorPending)" />
        <path d={progPaths.areaPath} fill="url(#svgColorInProgress)" />
        <path d={compPaths.areaPath} fill="url(#svgColorCompleted)" />
        
        <path d={pendPaths.linePath} fill="none" stroke="#8B5CF6" strokeWidth={2} />
        <path d={progPaths.linePath} fill="none" stroke="#F59E0B" strokeWidth={2} />
        <path d={compPaths.linePath} fill="none" stroke="#10AFA5" strokeWidth={2} />
      </svg>
    </div>
  );
};

// Helper component for pure SVG Donut Chart
const SvgDonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-xs text-center py-10 font-bold">No data</div>;
  }
  
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = 70;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedAngle = 0;
  
  return (
    <svg viewBox="0 0 200 200" className="w-[180px] h-[180px]">
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#F8FAFC" strokeWidth={strokeWidth} />
      {data.map((item, i) => {
        const percentage = total > 0 ? (item.value || 0) / total : 0;
        const strokeLength = percentage * circumference;
        const strokeOffset = circumference - strokeLength + accumulatedAngle;
        accumulatedAngle -= strokeLength;
        
        return (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 100 100)"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        );
      })}
    </svg>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Date Filter State - Defaulting to May 2025 to match the reference screenshot data
  const [datePreset, setDatePreset] = useState('may2025');
  const [customRange, setCustomRange] = useState({
    startDate: '2025-05-01',
    endDate: '2025-05-31'
  });

  // Calculate start/end dates based on presets
  const getDateRange = () => {
    const today = new Date();
    if (datePreset === 'thisweek') {
      const start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { 
        startDate: start.toISOString().split('T')[0], 
        endDate: today.toISOString().split('T')[0] 
      };
    } else if (datePreset === 'thismonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { 
        startDate: start.toISOString().split('T')[0], 
        endDate: today.toISOString().split('T')[0] 
      };
    } else if (datePreset === 'may2025') {
      return {
        startDate: '2025-05-01',
        endDate: '2025-05-31'
      };
    }
    // Custom
    return customRange;
  };

  const { startDate, endDate } = getDateRange();

  // React Query Fetchers
  const { data: summary, isLoading: loadSummary, error: errSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['b2bSummary', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/b2b/dashboard/summary', { params: { startDate, endDate } });
      return res.data.data;
    },
    retry: 2
  });

  const { data: overview, isLoading: loadOverview, error: errOverview } = useQuery({
    queryKey: ['b2bOverview', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/b2b/dashboard/jobs-overview', { params: { startDate, endDate } });
      return res.data.data;
    },
    retry: 2
  });

  const { data: statusDist, isLoading: loadStatus, error: errStatus } = useQuery({
    queryKey: ['b2bStatus', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/b2b/dashboard/jobs-status', { params: { startDate, endDate } });
      return res.data.data;
    },
    retry: 2
  });

  const { data: recentJobs, isLoading: loadJobs, error: errJobs } = useQuery({
    queryKey: ['b2bRecentJobs', startDate, endDate],
    queryFn: async () => {
      const res = await api.get('/b2b/dashboard/recent-jobs', { params: { startDate, endDate } });
      return res.data.data;
    },
    retry: 2
  });

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 font-sans antialiased text-gray-700 bg-gray-50/50 p-2 min-h-screen">
      
      {/* Top Header Row with Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Dashboard</h2>
        </div>

        {/* Date presets and Picker Card */}
        <div className="bg-white border border-[#E6F4F2] px-4 py-2.5 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm text-xs font-bold text-gray-600">
          <div className="flex items-center gap-1 text-[#10AFA5]">
            <FiCalendar className="w-4 h-4" />
          </div>

          <select 
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
          >
            <option value="may2025">May 2025 (Reference Data)</option>
            <option value="thisweek">This Week</option>
            <option value="thismonth">This Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
              <input 
                type="date" 
                name="startDate"
                value={customRange.startDate}
                onChange={handleCustomDateChange}
                className="bg-transparent border-none text-[10px] text-gray-600 focus:ring-0 outline-none"
              />
              <span className="text-gray-300">to</span>
              <input 
                type="date" 
                name="endDate"
                value={customRange.endDate}
                onChange={handleCustomDateChange}
                className="bg-transparent border-none text-[10px] text-gray-600 focus:ring-0 outline-none"
              />
            </div>
          )}

          <span className="text-gray-400 font-semibold border-l border-gray-100 pl-3">
            {formatDateLabel(startDate)} - {formatDateLabel(endDate)}
          </span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* KPI Card: Total Jobs */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/25 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Jobs</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#10AFA5] flex items-center justify-center border border-teal-100 shrink-0">
              <FiBriefcase className="w-4 h-4" />
            </div>
          </div>
          {loadSummary ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : errSummary ? (
            <span className="text-red-500 text-xs">Error</span>
          ) : (
            <div>
              <p className="text-2xl font-black text-gray-800 leading-none">{summary?.totalJobs?.value.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-2.5">
                {summary?.totalJobs?.change >= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5"><FiArrowUpRight /> {summary.totalJobs.change}%</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-0.5"><FiArrowDownRight /> {Math.abs(summary.totalJobs.change)}%</span>
                )}
                <span className="text-gray-400 font-semibold">from last month</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Card: In Progress */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/25 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0">
              <FiLoader className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          {loadSummary ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : errSummary ? (
            <span className="text-red-500 text-xs">Error</span>
          ) : (
            <div>
              <p className="text-2xl font-black text-gray-800 leading-none">{summary?.inProgress?.value.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-2.5">
                {summary?.inProgress?.change >= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5"><FiArrowUpRight /> {summary.inProgress.change}%</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-0.5"><FiArrowDownRight /> {Math.abs(summary.inProgress.change)}%</span>
                )}
                <span className="text-gray-400 font-semibold">from last month</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Card: Completed */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/25 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          {loadSummary ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : errSummary ? (
            <span className="text-red-500 text-xs">Error</span>
          ) : (
            <div>
              <p className="text-2xl font-black text-gray-800 leading-none">{summary?.completed?.value.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-2.5">
                {summary?.completed?.change >= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5"><FiArrowUpRight /> {summary.completed.change}%</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-0.5"><FiArrowDownRight /> {Math.abs(summary.completed.change)}%</span>
                )}
                <span className="text-gray-400 font-semibold">from last month</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Card: Pending */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/25 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shrink-0">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          {loadSummary ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : errSummary ? (
            <span className="text-red-500 text-xs">Error</span>
          ) : (
            <div>
              <p className="text-2xl font-black text-gray-800 leading-none">{summary?.pending?.value.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-2.5">
                {summary?.pending?.change <= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5"><FiArrowDownRight /> {Math.abs(summary.pending.change)}%</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-0.5"><FiArrowUpRight /> {summary.pending.change}%</span>
                )}
                <span className="text-gray-400 font-semibold">from last month</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Card: Total Spent */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/25 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#10AFA5] flex items-center justify-center border border-teal-100 shrink-0">
              <FiTrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loadSummary ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : errSummary ? (
            <span className="text-red-500 text-xs">Error</span>
          ) : (
            <div>
              <p className="text-xl font-black text-gray-800 leading-none">₹{summary?.totalSpent?.value.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-3">
                {summary?.totalSpent?.change >= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5"><FiArrowUpRight /> {summary.totalSpent.change}%</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-0.5"><FiArrowDownRight /> {Math.abs(summary.totalSpent.change)}%</span>
                )}
                <span className="text-gray-400 font-semibold">from last month</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Card: Wallet Balance */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm flex flex-col justify-between hover:border-[#10AFA5]/25 transition-all min-h-[125px]">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Wallet Balance</span>
            {loadSummary ? (
              <div className="h-6 w-16 bg-gray-100 animate-pulse rounded-lg mt-2.5"></div>
            ) : errSummary ? (
              <span className="text-red-500 text-xs mt-1.5 block">Error</span>
            ) : (
              <p className="text-xl font-black text-gray-800 mt-2.5 leading-none">₹{summary?.walletBalance?.value.toLocaleString('en-IN')}</p>
            )}
          </div>

          <Link 
            to="/b2b/wallet"
            className="flex items-center gap-1 text-[#10AFA5] hover:opacity-85 transition-opacity text-[10px] font-black uppercase tracking-wide pt-2 mt-2 border-t border-gray-50/50"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Top Up Wallet
          </Link>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Jobs Overview Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-800">Jobs Overview</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Daily dispatches</span>
          </div>

          <div className="flex-1 min-h-[280px]">
            {loadOverview ? (
              <div className="w-full h-full flex items-center justify-center">
                <FiLoader className="w-8 h-8 text-[#10AFA5] animate-spin" />
              </div>
            ) : errOverview ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-red-500 text-xs font-bold gap-2">
                <FiAlertCircle className="w-8 h-8" />
                <span>Failed to load line chart metrics.</span>
              </div>
            ) : (
              <SvgAreaChart data={overview} />
            )}
          </div>
          
          <div className="flex gap-4 justify-center items-center text-[10px] font-bold text-gray-500 pt-3 mt-3 border-t border-gray-50">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#10AFA5]"></span> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F59E0B]"></span> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#8B5CF6]"></span> Pending</span>
          </div>
        </div>

        {/* Right Side: Jobs Status Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-800">Jobs by Status</h3>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
            {loadStatus ? (
              <FiLoader className="w-8 h-8 text-[#10AFA5] animate-spin" />
            ) : errStatus ? (
              <span className="text-red-500 text-xs font-bold">Failed to load status ratios.</span>
            ) : (
              <>
                <SvgDonutChart data={statusDist?.distribution} />
                
                {/* Center text inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-800">{statusDist?.total?.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Jobs</span>
                </div>
              </>
            )}
          </div>

          {/* Legend section displaying detailed stats */}
          <div className="space-y-2.5 pt-4 border-t border-gray-50 mt-4">
            {statusDist?.distribution?.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-500">{item.name}</span>
                </div>
                <span className="text-gray-800">
                  {item.value} <span className="text-gray-400 font-semibold">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Jobs Table Card */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-6">
          <h3 className="text-sm font-bold text-gray-800">Recent Jobs</h3>
          <Link 
            to="/b2b/jobs"
            className="text-xs font-bold bg-gray-50 text-[#10AFA5] hover:bg-[#F0FDFA] px-3.5 py-1.5 rounded-xl border border-[#E6F4F2] transition-colors"
          >
            View All
          </Link>
        </div>

        {loadJobs ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : errJobs ? (
          <div className="text-center py-10 text-red-500 text-xs font-bold">
            Failed to load jobs list records.
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-bold">
            No dispatches created yet. Use 'Bulk Jobs' or 'Create Jobs' to launch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 font-bold pb-3">
                  <th className="pb-3 pr-4">Job ID</th>
                  <th className="pb-3 px-4">Service</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Priority</th>
                  <th className="pb-3 px-4">Assigned To</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {recentJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50/25 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[#10AFA5] cursor-pointer hover:underline" onClick={() => navigate('/b2b/jobs')}>
                      {job.jobId}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-800">{job.service}</td>
                    <td className="py-4 px-4 text-gray-500">{job.location}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        job.priority === 'High' 
                          ? 'bg-red-50 text-red-500' 
                          : job.priority === 'Medium'
                            ? 'bg-amber-50/70 text-amber-600'
                            : 'bg-green-50 text-green-600'
                      }`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{job.assignedTo || 'Unassigned'}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        job.status === 'completed' || job.status === 'in_progress'
                          ? 'bg-[#E6F4F2] text-[#10AFA5]' 
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {job.status === 'in_progress' ? 'In Progress' : job.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-gray-400 text-[10px]">
                      {new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
