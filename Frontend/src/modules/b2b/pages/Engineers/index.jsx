import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FiSearch, FiFilter, FiRefreshCw, FiDownload, FiMapPin, 
  FiUser, FiMoreVertical, FiEye, FiNavigation, FiPhone, FiMessageCircle, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import api from '../../../../services/api';
import { useSocket } from '../../../../context/SocketContext';
import EngineerDetailsDrawer from './components/EngineerDetailsDrawer';
import EngineerTrackingModal from './components/EngineerTrackingModal';

const Engineers = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Filters State
  const [activeTab, setActiveTab] = useState('All Engineers');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    skill: 'all',
    city: 'all',
    rating: 'all',
    experience: 'all'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [trackingEngineer, setTrackingEngineer] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Socket.IO Realtime Refetching
  useEffect(() => {
    if (!socket) return;
    const refetchData = () => {
      queryClient.invalidateQueries(['b2bEngineersList']);
      queryClient.invalidateQueries(['b2bEngineersStats']);
    };

    socket.on('b2b:engineerStatusChanged', refetchData);
    socket.on('b2b:jobCompleted', refetchData);
    socket.on('b2b:engineerAssigned', refetchData);
    
    return () => {
      socket.off('b2b:engineerStatusChanged', refetchData);
      socket.off('b2b:jobCompleted', refetchData);
      socket.off('b2b:engineerAssigned', refetchData);
    };
  }, [socket, queryClient]);

  // Fetch Stats
  const { data: statsRes } = useQuery({
    queryKey: ['b2bEngineersStats'],
    queryFn: async () => {
      const res = await api.get('/b2b/engineers/stats');
      return res.data;
    },
    refetchInterval: 30000
  });

  const stats = statsRes?.stats || {};

  // Fetch Engineers List
  const { data: engineersRes, isLoading } = useQuery({
    queryKey: ['b2bEngineersList', currentPage, itemsPerPage, activeTab, filters, debouncedSearch],
    queryFn: async () => {
      let effectiveStatus = filters.status;
      if (activeTab !== 'All Engineers') {
        const tabMatch = activeTab.match(/([a-zA-Z\s]+)/);
        if (tabMatch) {
           effectiveStatus = tabMatch[1].trim();
        }
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        status: effectiveStatus !== 'all' ? effectiveStatus : undefined,
        skill: filters.skill !== 'all' ? filters.skill : undefined,
        city: filters.city !== 'all' ? filters.city : undefined,
        rating: filters.rating !== 'all' ? filters.rating : undefined,
        experience: filters.experience !== 'all' ? filters.experience : undefined
      };

      const res = await api.get('/b2b/engineers', { params });
      return res.data;
    }
  });

  const engineers = engineersRes?.data || [];
  const pagination = engineersRes?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ status: 'all', skill: 'all', city: 'all', rating: 'all', experience: 'all' });
    setSearchQuery('');
    setActiveTab('All Engineers');
    setCurrentPage(1);
  };

  const exportEngineers = async () => {
    try {
      const res = await api.get('/b2b/engineers/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Assigned_Engineers_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Available</span>;
      case 'on_the_way':
      case 'assigned':
      case 'in_progress': return <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"/> {status === 'in_progress' ? 'On Job' : 'Busy'}</span>;
      case 'suspended': return <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"/> On Leave</span>;
      default: return <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"/> Offline</span>;
    }
  };

  // Mock Performance Data for Right Panel Chart
  const perfChartData = [
    { day: 'Mon', jobs: 12 }, { day: 'Tue', jobs: 19 }, { day: 'Wed', jobs: 15 },
    { day: 'Thu', jobs: 22 }, { day: 'Fri', jobs: 28 }, { day: 'Sat', jobs: 14 }, { day: 'Sun', jobs: 8 }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-fade-in pb-10">
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Engineers</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage all engineers assigned to your jobs in real-time.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => queryClient.invalidateQueries(['b2bEngineersList'])} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm text-sm">
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={exportEngineers} className="bg-[#10AFA5] border border-[#10AFA5] text-white hover:bg-[#0e968e] px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm text-sm">
              <FiDownload className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Engineers', value: stats.totalEngineers || 0, sub: `↑ 12 this month`, icon: <FiUser />, color: 'text-[#10AFA5]', bg: 'bg-[#E6F4F2]' },
            { label: 'Available', value: stats.available || 0, sub: `${stats.totalEngineers ? Math.round((stats.available/stats.totalEngineers)*100) : 0}% of total`, icon: <FiUser />, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Busy', value: stats.busy || 0, sub: `${stats.totalEngineers ? Math.round((stats.busy/stats.totalEngineers)*100) : 0}% of total`, icon: <FiClock />, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'On Job', value: stats.onJob || 0, sub: `${stats.totalEngineers ? Math.round((stats.onJob/stats.totalEngineers)*100) : 0}% of total`, icon: <FiMapPin />, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Offline', value: stats.offline || 0, sub: `${stats.totalEngineers ? Math.round((stats.offline/stats.totalEngineers)*100) : 0}% of total`, icon: <FiUser />, color: 'text-gray-500', bg: 'bg-gray-100' },
            { label: 'Avg. Rating', value: stats.averageRating || '0.0', sub: `⭐ ${stats.averageRating || 0}`, icon: <FiStar />, color: 'text-yellow-500', bg: 'bg-yellow-50' }
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <p className="text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">{card.label}</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{card.value}</h3>
                  <p className="text-[10px] font-semibold text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className={`w-8 h-8 rounded-full ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Search Engineer</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID or phone..." className="w-full h-9 pl-9 pr-3 border border-gray-200 text-sm font-medium rounded-lg focus:ring-1 focus:ring-[#10AFA5] outline-none transition-all text-gray-700" />
              </div>
            </div>
            {[
              { label: 'Status', key: 'status', options: ['All Status', 'Available', 'Busy', 'Offline', 'On Leave'] },
              { label: 'Skill', key: 'skill', options: ['All Skills', 'AC Repair', 'Electrical', 'Plumbing', 'Cleaning'] },
              { label: 'City', key: 'city', options: ['All Cities', 'Mumbai', 'Delhi', 'Pune'] },
              { label: 'Rating', key: 'rating', options: ['All Ratings', '4', '4.5'] }
            ].map((f, i) => (
              <div key={i} className="w-[120px] md:w-[140px]">
                <label className="block text-[11px] font-bold text-gray-500 mb-1">{f.label}</label>
                <select value={filters[f.key]} onChange={(e) => handleFilterChange(f.key, e.target.value)} className="w-full h-9 px-3 border border-gray-200 text-sm font-medium rounded-lg outline-none focus:ring-1 focus:ring-[#10AFA5] bg-white text-gray-700">
                  {f.options.map(opt => <option key={opt} value={opt.toLowerCase().includes('all') ? 'all' : opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => queryClient.invalidateQueries(['b2bEngineersList'])} className="h-9 px-4 bg-[#10AFA5] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e968e]">Apply Filters</button>
              <button onClick={resetFilters} className="h-9 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-1.5"><FiRefreshCw className="w-3.5 h-3.5"/> Reset</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-6 px-2 overflow-x-auto no-scrollbar">
          {[`All Engineers`, `Available (${stats.available || 0})`, `Busy (${stats.busy || 0})`, `On Job (${stats.onJob || 0})`, `Offline (${stats.offline || 0})`].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`py-3 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-[#10AFA5] text-[#10AFA5]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Engineers Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-visible">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-600">
                  <th className="py-4 pl-6 pr-4">Engineer</th>
                  <th className="py-4 px-4">Details</th>
                  <th className="py-4 px-4">Skills</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Current Job</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4 text-center">Jobs</th>
                  <th className="py-4 px-4">Last Active</th>
                  <th className="py-4 pr-6 pl-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-16"><div className="animate-spin w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full mx-auto" /></td></tr>
                ) : engineers.length > 0 ? (
                  engineers.map(eng => (
                    <tr key={eng._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <img src={eng.profilePhoto || 'https://via.placeholder.com/40'} alt="Eng" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{eng.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">ID: ENG-{eng._id.slice(-4).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><FiPhone className="w-2.5 h-2.5"/> {eng.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold text-gray-800">{eng.experienceLevel || 'Fresher'}</p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{eng.address?.city || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 flex-wrap w-32">
                          {eng.serviceCategories?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{s.split(' ')[0]}</span>
                          ))}
                          {eng.serviceCategories?.length > 2 && <span className="text-[10px] font-bold text-gray-500 px-1 py-0.5">+{eng.serviceCategories.length - 2}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(eng.status)}
                      </td>
                      <td className="py-4 px-4">
                        {eng.currentJob ? (
                          <>
                            <p className="text-xs font-bold text-[#10AFA5]">{eng.currentJob.jobId}</p>
                            <p className="text-[10px] font-semibold text-gray-700 mt-0.5">{eng.currentJob.service}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{eng.currentJob.city}</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 font-bold">—<br/><span className="text-[10px] font-medium">Not Assigned</span></p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1"><FiMapPin className="text-gray-400"/> {eng.address?.city || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 pl-4">{eng.status === 'in_progress' ? 'On Job' : 'Available'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1"><FiStar className="text-yellow-500 fill-current"/> {eng.rating?.toFixed(1) || '0.0'}</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5 pl-5">({eng.completedJobs || 0})</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-sm font-black text-gray-900">{eng.completedJobs}</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Total</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${eng.status === 'offline' ? 'bg-gray-300' : 'bg-green-500'}`}/>
                          {new Date(eng.lastActive).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB') ? 'Today' : new Date(eng.lastActive).toLocaleDateString('en-GB')}
                        </p>
                      </td>
                      <td className="py-4 pr-6 pl-4 text-center">
                        <div className="flex justify-center gap-2 relative">
                          <button onClick={() => setSelectedEngineer(eng._id)} className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#10AFA5] hover:border-[#10AFA5] transition-colors" title="View Profile">
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          {eng.currentJob && (
                            <button onClick={() => setTrackingEngineer(eng._id)} className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-500 hover:border-blue-500 transition-colors" title="Track Live">
                              <FiNavigation className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="relative">
                            <button onClick={() => setActiveMenu(activeMenu === eng._id ? null : eng._id)} className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                              <FiMoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeMenu === eng._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                <div className="absolute right-0 top-8 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5] flex items-center gap-2"><FiPhone/> Call</button>
                                  <button className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5] flex items-center gap-2"><FiMessageCircle/> Chat</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={10} className="text-center py-16 text-gray-400 font-bold text-sm">No engineers found matching criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500">
            <div>Showing {pagination.total > 0 ? (pagination.page - 1) * itemsPerPage + 1 : 0} to {Math.min(pagination.page * itemsPerPage, pagination.total)} of {pagination.total} results</div>
            <div className="flex gap-2">
              <button disabled={currentPage===1} onClick={()=>setCurrentPage(c=>c-1)} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button disabled={currentPage===pagination.totalPages || pagination.total===0} onClick={()=>setCurrentPage(c=>c+1)} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <div className="w-full xl:w-80 space-y-6 shrink-0">
        
        {/* Live Tracking Map Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><FiNavigation className="text-[#10AFA5]"/> Live Tracking</h3>
            <button onClick={() => window.location.href='/b2b/live-tracking'} className="text-[10px] font-bold text-[#10AFA5] hover:underline">View All</button>
          </div>
          <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden relative mb-4">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=11&size=400x200&sensor=false')] bg-cover opacity-70"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-[#10AFA5] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"/>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <img src="https://via.placeholder.com/30" className="w-8 h-8 rounded-full border border-gray-200" alt="Eng" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-900 truncate">Rahul Sharma</p>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">JOB-12499</span>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5 truncate">En Route to Customer</p>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                <span>ETA: 15 mins</span>
                <span>6.5 km</span>
              </div>
            </div>
          </div>
          <button onClick={() => setTrackingEngineer('mock')} className="w-full mt-4 py-2 border border-[#10AFA5] text-[#10AFA5] text-xs font-bold rounded-lg hover:bg-[#F0FDFA] transition-colors">Track on Map »</button>
        </div>

        {/* Engineer Performance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Performance <span className="text-gray-400 font-semibold">(This Month)</span></h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-500 mb-1">Jobs Completed</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-black text-gray-900">256</p>
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfChartData}><Area type="monotone" dataKey="jobs" stroke="#10AFA5" fill="#E6F4F2" strokeWidth={2}/></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-bold text-gray-500 mb-1">Avg. Rating</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-black text-gray-900">4.6</p>
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfChartData}><Area type="monotone" dataKey="jobs" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2}/></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1"><span>Acceptance Rate</span><span>92%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#10AFA5] h-1 rounded-full w-[92%]"/></div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1"><span>On-time Completion</span><span>89%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full w-[89%]"/></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Drawers / Modals */}
      {selectedEngineer && <EngineerDetailsDrawer engineerId={selectedEngineer} onClose={() => setSelectedEngineer(null)} />}
      {trackingEngineer && <EngineerTrackingModal engineerId={trackingEngineer === 'mock' ? engineers[0]?._id : trackingEngineer} onClose={() => setTrackingEngineer(null)} />}
    </div>
  );
};

export default Engineers;
