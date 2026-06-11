import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, FiClipboard, FiFlag, FiDollarSign, 
  FiArrowUpRight, FiArrowDownRight, FiClock, FiPlus,
  FiFileText, FiTarget, FiFilePlus, FiCalendar, FiUser
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import api from '../../../../services/api';
import LogoLoader from '../../../../components/common/LogoLoader';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#9CA3AF'];
const BAR_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

const DigitalDashboard = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDigitalStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendors/dashboard/digital-stats');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching digital dashboard:', error);
        toast.error('Failed to load digital dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDigitalStats();
  }, []);

  if (loading || !data) {
    return <LogoLoader />;
  }

  const { topStats, charts, tables, taskBoard, timeTracking, campaigns, proposals } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#0D8A72] px-4 py-2 outline-none">
            <option>All Clients</option>
            <option>Active Clients</option>
          </select>
          <div className="relative">
            <input type="text" placeholder="Search anything..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0D8A72]" />
            <FiBriefcase className="absolute left-4 top-2.5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">May 20 - May 26, 2024</span>
          <button className="flex items-center gap-2 bg-[#0D8A72] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#0a6b58] transition-colors">
            <FiPlus /> New Work Order
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0D8A72]/10 flex items-center justify-center text-[#0D8A72]">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Projects</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-bold text-gray-800">{topStats.activeProjects}</h3>
              <div className="text-right">
                <p className="text-xs text-gray-400">In Progress: <span className="font-bold text-gray-700">{topStats.inProgressProjects}</span></p>
                <p className="text-xs text-gray-400">Completed: <span className="font-bold text-gray-700">{topStats.completedProjects}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Work Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
            <FiClipboard className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Work Orders</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-bold text-gray-800">{topStats.pendingWorkOrders}</h3>
              <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded flex items-center"><FiArrowUpRight/> 18%</span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
            <FiFlag className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Milestones Due</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-bold text-gray-800">{topStats.milestonesDueThisWeek}</h3>
              <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded flex items-center"><FiArrowUpRight/> 20%</span>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#10AFA5]/10 flex items-center justify-center text-[#10AFA5]">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-bold text-gray-800">₹{topStats.totalEarnings.toLocaleString()}</h3>
              <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded flex items-center"><FiArrowUpRight/> 16%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Area Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Earnings Overview</h3>
            <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 outline-none font-medium"><option>This Week</option></select>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D8A72" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D8A72" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                <Area type="monotone" dataKey="revenue" stroke="#0D8A72" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Donut */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Project Status</h3>
          <div className="flex items-center justify-center h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.projectStatusData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {charts.projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{topStats.activeProjects}</span>
              <span className="text-[10px] text-gray-500 uppercase">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {charts.projectStatusData.map(status => (
              <div key={status.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                <span className="text-xs font-medium text-gray-600">{status.name} <span className="font-bold text-gray-800 ml-1">{status.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Order Types Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Work Order Types</h3>
            <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 outline-none font-medium"><option>This Week</option></select>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.workOrderTypesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} dy={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {charts.workOrderTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Recent Work Orders</h3>
            <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">WO ID</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tables.recentWorkOrders.map(wo => (
                <tr key={wo.workOrderId} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 text-xs font-semibold text-indigo-600">{wo.workOrderId}</td>
                  <td className="py-3 text-xs font-bold text-gray-800">{wo.client || wo.userId?.name || 'N/A'}</td>
                  <td className="py-3 text-xs text-gray-500">{wo.type}</td>
                  <td className="py-3 text-xs text-gray-600">{wo.project}</td>
                  <td className="py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${wo.priority==='High'?'bg-red-100 text-red-600':wo.priority==='Medium'?'bg-orange-100 text-orange-600':'bg-green-100 text-green-600'}`}>{wo.priority || 'Medium'}</span>
                  </td>
                  <td className="py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${wo.status==='Completed'?'bg-green-100 text-green-600':wo.status==='In Progress'?'bg-blue-100 text-blue-600':wo.status==='Assigned'?'bg-indigo-100 text-indigo-600':'bg-orange-100 text-orange-600'}`}>{wo.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Clients by Revenue */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Top Clients By Revenue</h3>
            <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View Report</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium text-center">Projects</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {tables.topClients.map((client, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 text-xs font-bold text-gray-800">{client.name}</td>
                  <td className="py-3 text-xs text-gray-600 text-center">{client.projects}</td>
                  <td className="py-3 text-xs font-bold text-green-600 text-right">₹{client.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Board & Time Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Developer Task Board (Kanban style) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Developer Task Board</h3>
            <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View Board</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase flex justify-between">To Do <span className="bg-white px-2 rounded-full border">{taskBoard.toDo.length}</span></h4>
              <div className="space-y-3">
                {taskBoard.toDo.map(t => (
                  <div key={t._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-300">
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{t.category}</span>
                    <p className="text-xs font-bold text-gray-800 mt-2">{t.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{t.projectType}</p>
                  </div>
                ))}
                <button className="w-full py-2 text-xs font-bold text-gray-400 hover:text-indigo-600 border border-dashed rounded-lg flex items-center justify-center gap-1"><FiPlus/> Add Task</button>
              </div>
            </div>
            {/* In Progress Column */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-blue-600 mb-3 uppercase flex justify-between">In Progress <span className="bg-white px-2 rounded-full border">{taskBoard.inProgress.length}</span></h4>
              <div className="space-y-3">
                {taskBoard.inProgress.map(t => (
                  <div key={t._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500 cursor-pointer hover:border-blue-300">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{t.category}</span>
                    <p className="text-xs font-bold text-gray-800 mt-2">{t.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{t.projectType}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Completed Column */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-green-600 mb-3 uppercase flex justify-between">Completed <span className="bg-white px-2 rounded-full border">{taskBoard.completed.length}</span></h4>
              <div className="space-y-3">
                {taskBoard.completed.map(t => (
                  <div key={t._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-green-500 opacity-75">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{t.category}</span>
                    <p className="text-xs font-bold text-gray-800 mt-2 line-through decoration-gray-300">{t.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{t.projectType}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracking Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Time Tracking Summary</h3>
            <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 outline-none font-medium"><option>This Week</option></select>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-32 h-32 relative mb-4">
               {/* Custom SVG Donut for precise look */}
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                  <path className="text-green-500" strokeDasharray="76, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                  <path className="text-blue-500" strokeDasharray="15, 100" strokeDashoffset="-76" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                  <path className="text-orange-500" strokeDasharray="9, 100" strokeDashoffset="-91" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xl font-black text-gray-800">{timeTracking.totalHours}h</span>
                 <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Total Hours</span>
               </div>
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Billable</span>
                <span className="font-bold text-gray-800">{timeTracking.billableHours}h <span className="text-gray-400 font-normal ml-1">({Math.round((timeTracking.billableHours/timeTracking.totalHours)*100)}%)</span></span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Non-Billable</span>
                <span className="font-bold text-gray-800">{timeTracking.nonBillableHours}h <span className="text-gray-400 font-normal ml-1">({Math.round((timeTracking.nonBillableHours/timeTracking.totalHours)*100)}%)</span></span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Break Time</span>
                <span className="font-bold text-gray-800">{timeTracking.breakTimeHours}h <span className="text-gray-400 font-normal ml-1">({Math.round((timeTracking.breakTimeHours/timeTracking.totalHours)*100)}%)</span></span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 w-full gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-gray-400">Billable Rate</p>
                <p className="text-sm font-black text-gray-800">₹{timeTracking.billableRate} <span className="text-[10px] font-normal text-gray-500">/hr</span></p>
              </div>
              <div className="text-center border-l border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400">Utilization</p>
                <p className="text-sm font-black text-[#0D8A72]">{timeTracking.utilization}%</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        
        {/* Campaign Performance */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Campaign Performance (Digital Marketing)</h3>
            <select className="text-xs border-none bg-gray-50 rounded px-2 py-1 outline-none font-medium"><option>This Month</option></select>
          </div>
          
          {/* Top Level Aggregate Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Impressions</p>
              <h4 className="text-lg font-black text-gray-800 mt-1">{(campaigns.reduce((sum, c) => sum + c.impressions, 0) / 1000000).toFixed(1)}M</h4>
              <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight/> 10%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Clicks</p>
              <h4 className="text-lg font-black text-gray-800 mt-1">{(campaigns.reduce((sum, c) => sum + c.clicks, 0) / 1000).toFixed(1)}K</h4>
              <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight/> 22%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Conversions</p>
              <h4 className="text-lg font-black text-gray-800 mt-1">{(campaigns.reduce((sum, c) => sum + c.conversions, 0) / 1000).toFixed(1)}K</h4>
              <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight/> 25%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Avg CTR</p>
              <h4 className="text-lg font-black text-gray-800 mt-1">{(campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(2)}%</h4>
              <p className="text-[10px] text-green-500 font-bold flex items-center mt-1"><FiArrowUpRight/> 5%</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Top Campaigns</th>
                <th className="pb-2 font-medium text-right">CTR</th>
                <th className="pb-2 font-medium text-right">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-xs font-bold text-gray-800 flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${camp.platform==='Google'?'bg-red-500':camp.platform==='Facebook'?'bg-blue-600':'bg-blue-800'}`}>
                      {camp.platform[0]}
                    </div>
                    {camp.name}
                  </td>
                  <td className="py-2 text-xs font-bold text-gray-700 text-right">{camp.ctr}%</td>
                  <td className="py-2 text-xs font-bold text-[#0D8A72] text-right">{camp.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Proposal & Quotation Builder */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Proposal Builder</h3>
            <span className="text-xs font-bold text-[#0D8A72] cursor-pointer">View All</span>
          </div>
          <div className="space-y-3">
            {proposals.map((prop, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400">{prop.proposalId}</p>
                  <p className="text-xs font-bold text-gray-800">{prop.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-800">₹{prop.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prop.status==='Sent'?'bg-blue-100 text-blue-600':prop.status==='Accepted'?'bg-green-100 text-green-600':prop.status==='Pending'?'bg-orange-100 text-orange-600':'bg-gray-100 text-gray-600'}`}>{prop.status}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#0D8A72] font-bold text-sm rounded-lg flex justify-center items-center gap-2 transition-colors">
            <FiFilePlus/> New Proposal
          </button>
        </div>

      </div>

    </div>
  );
});

DigitalDashboard.displayName = 'DigitalDashboard';
export default DigitalDashboard;
