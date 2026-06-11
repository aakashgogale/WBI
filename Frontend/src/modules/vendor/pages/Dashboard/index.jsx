import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, FiShield, FiClipboard, FiCalendar, 
  FiArrowUpRight, FiArrowDownRight 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { vendorDashboardService } from '../../services/dashboardService';
import LogoLoader from '../../../../components/common/LogoLoader';
import DigitalDashboard from './DigitalDashboard';
import toast from 'react-hot-toast';

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeAMC: 0,
    pendingWorkOrders: 0,
    totalEarnings: 0
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([
    { name: 'Completed', value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Pending', value: 0 }
  ]);
  const [isDigitalVendor, setIsDigitalVendor] = useState(false);

  useEffect(() => {
    // Check if the vendor belongs to the Digital Solutions category
    try {
      const vendorData = JSON.parse(localStorage.getItem('vendorData'));
      // ID for 'Digital Solutions' category from DB
      const DIGITAL_CATEGORY_ID = '6a23fd15f2513e09a97eeb7f';
      
      if (vendorData && vendorData.categories) {
        if (vendorData.categories.includes(DIGITAL_CATEGORY_ID)) {
          setIsDigitalVendor(true);
        }
      }
    } catch (e) {
      console.error('Failed to parse vendor data', e);
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await vendorDashboardService.getDashboardStats();
        if (res.success) {
          const { stats: apiStats, recentWorkOrders: apiRecentWOs } = res.data;
          
          setStats({
            totalProjects: apiStats?.totalProjects || 0,
            activeAMC: apiStats?.activeAMC || 0,
            pendingWorkOrders: apiStats?.pendingWorkOrders || 0,
            totalEarnings: apiStats?.totalEarnings || 0
          });

          setRecentWorkOrders(apiRecentWOs || []);

          // Static data for charts for now, until real endpoints are populated with real history
          setRevenueData([
            { name: '20 May', revenue: 45000 },
            { name: '21 May', revenue: 120000 },
            { name: '22 May', revenue: 80000 },
            { name: '23 May', revenue: 170000 },
            { name: '24 May', revenue: 110000 },
            { name: '25 May', revenue: 200000 },
            { name: '26 May', revenue: 250000 }
          ]);

          setProjectStatusData([
            { name: 'Completed', value: Math.floor(Math.random() * 10) + 5 },
            { name: 'In Progress', value: Math.floor(Math.random() * 10) + 2 },
            { name: 'Pending', value: Math.floor(Math.random() * 10) + 1 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LogoLoader />;
  }

  // Render highly-specialized Digital Dashboard if applicable
  if (isDigitalVendor) {
    return <DigitalDashboard />;
  }

  const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your Vendor Panel 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Projects</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalProjects}</h3>
            </div>
            <div className="p-2.5 bg-[#10AFA5]/10 rounded-lg">
              <FiBriefcase className="w-5 h-5 text-[#10AFA5]" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiArrowUpRight className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12%</span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
        </div>

        {/* Active AMC */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active AMC</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeAMC}</h3>
            </div>
            <div className="p-2.5 bg-indigo-100 rounded-lg">
              <FiShield className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiArrowUpRight className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8%</span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
        </div>

        {/* Pending Work Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending Work Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingWorkOrders}</h3>
            </div>
            <div className="p-2.5 bg-orange-100 rounded-lg">
              <FiClipboard className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiArrowUpRight className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+15%</span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-800">₹{stats.totalEarnings.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold text-lg">₹</span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiArrowUpRight className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+18%</span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Earnings Overview</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-[#10AFA5] focus:border-[#10AFA5] px-3 py-1.5 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10AFA5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10AFA5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => val >= 100000 ? `${(val/100000).toFixed(1)}L` : `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10AFA5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Project Status</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-800">
                {projectStatusData.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
              <span className="text-xs text-gray-500 font-medium">Total</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="mt-6 space-y-3">
            {projectStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                  <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{entry.value}</span>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {Math.round((entry.value / projectStatusData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Work Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Work Orders</h3>
            <button onClick={() => navigate('/vendor/work-orders')} className="text-[#10AFA5] text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentWorkOrders.length > 0 ? recentWorkOrders.map((wo, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => navigate(`/vendor/work-orders/${wo._id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FiClipboard className="text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{wo.workOrderId || 'WO-Unknown'}</h4>
                    <p className="text-xs text-gray-500">{wo.userId?.name || 'Customer'} • {wo.type || 'Maintenance'}</p>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    wo.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                    wo.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                    wo.status === 'Assigned' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {wo.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No recent work orders found.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Upcoming Schedules</h3>
            <button className="text-[#10AFA5] text-sm font-medium hover:underline">
              View Calendar
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                <div className="flex flex-col items-center justify-center w-12 pt-1">
                  <span className="text-[#10AFA5] font-bold text-lg leading-none">{27 + i}</span>
                  <span className="text-[#10AFA5] text-xs font-medium">May</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">Axis Bank - Connaught Place</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Preventive Maintenance</p>
                </div>
                <div className="text-right pt-1">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    10:00 AM
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

Dashboard.displayName = 'VendorDashboard';
export default Dashboard;
