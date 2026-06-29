import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiSearch, FiFilter, FiRefreshCw, FiDownload, FiMapPin, 
  FiClock, FiCheckCircle, FiAlertCircle, FiMoreVertical, 
  FiEye, FiEdit2, FiNavigation, FiTrash2, FiFileText, FiHeadphones, FiCheckSquare, FiAlertTriangle, FiUser, FiUploadCloud, FiBriefcase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../../../services/api';
import { useSocket } from '../../../../context/SocketContext';
import JobDetailsDrawer from './components/JobDetailsDrawer';
import LiveTrackingModal from './components/LiveTrackingModal';

const Jobs = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Filters State
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    service: 'all',
    city: 'all',
    priority: 'all',
    paymentStatus: 'all',
    batchId: 'all',
    startDate: '',
    endDate: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Drawers & Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [trackingJob, setTrackingJob] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Debounce Search
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
    const refetchJobs = () => {
      queryClient.invalidateQueries(['b2bJobsList']);
      queryClient.invalidateQueries(['b2bJobsStats']);
    };

    socket.on('job_updated', refetchJobs);
    socket.on('job_cancelled', refetchJobs);
    socket.on('engineer_assigned', refetchJobs);
    socket.on('b2b:batchCreated', refetchJobs); // Just in case

    return () => {
      socket.off('job_updated', refetchJobs);
      socket.off('job_cancelled', refetchJobs);
      socket.off('engineer_assigned', refetchJobs);
      socket.off('b2b:batchCreated', refetchJobs);
    };
  }, [socket, queryClient]);

  // Fetch Stats
  const { data: statsRes } = useQuery({
    queryKey: ['b2bJobsStats'],
    queryFn: async () => {
      const res = await api.get('/b2b/jobs/stats');
      return res.data;
    },
    refetchInterval: 30000
  });

  const stats = statsRes?.stats || {};
  const chartData = statsRes?.chartData || [];

  // Fetch Jobs List
  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['b2bJobsList', currentPage, itemsPerPage, activeTab, filters, debouncedSearch],
    queryFn: async () => {
      // Merge tab status with filter status
      let effectiveStatus = filters.status;
      if (activeTab !== 'all') {
        if (activeTab === 'failed_cancelled') {
          // Special case, backend might need to handle this or we pass multiple statuses. 
          // Assuming backend handles it, or we just pass activeTab as status
          effectiveStatus = 'failed'; 
        } else {
          effectiveStatus = activeTab.replace(' ', '_').toLowerCase();
        }
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        status: effectiveStatus !== 'all' ? effectiveStatus : undefined,
        service: filters.service !== 'all' ? filters.service : undefined,
        city: filters.city !== 'all' ? filters.city : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        paymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };

      const res = await api.get('/b2b/jobs', { params });
      return res.data;
    }
  });

  const jobs = jobsRes?.data || [];
  const pagination = jobsRes?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all', service: 'all', city: 'all', priority: 'all', 
      paymentStatus: 'all', batchId: 'all', startDate: '', endDate: ''
    });
    setSearchQuery('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const exportJobs = async () => {
    try {
      const res = await api.get('/b2b/jobs/export', { responseType: 'blob', params: { status: filters.status !== 'all' ? filters.status : undefined } });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Jobs_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const cancelJobMutation = useMutation({
    mutationFn: (id) => api.delete(`/b2b/jobs/${id}`),
    onSuccess: () => {
      toast.success('Job cancelled successfully');
      queryClient.invalidateQueries(['b2bJobsList']);
      queryClient.invalidateQueries(['b2bJobsStats']);
    },
    onError: () => toast.error('Failed to cancel job')
  });

  // KPI Card Configs
  const kpiCards = [
    { label: 'Total Jobs', value: stats.totalJobs || 0, icon: <FiFileText className="w-5 h-5 text-[#10AFA5]" />, trend: '↑ 18% from last month', trendColor: 'text-green-600', bg: 'bg-[#E6F4F2]' },
    { label: 'Pending', value: stats.pending || 0, icon: <FiClock className="w-5 h-5 text-orange-500" />, trend: '↑ 12% from last month', trendColor: 'text-green-600', bg: 'bg-orange-50' },
    { label: 'Assigned', value: stats.assigned || 0, icon: <FiCheckSquare className="w-5 h-5 text-purple-600" />, trend: '↑ 8% from last month', trendColor: 'text-green-600', bg: 'bg-purple-50' },
    { label: 'In Progress', value: stats.inProgress || 0, icon: <FiRefreshCw className="w-5 h-5 text-blue-500" />, trend: '↑ 15% from last month', trendColor: 'text-green-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: stats.completed || 0, icon: <FiCheckCircle className="w-5 h-5 text-green-600" />, trend: '↓ 20% from last month', trendColor: 'text-red-500', bg: 'bg-green-50' }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-600 border border-green-100';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'assigned': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'engineer_on_way': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'failed':
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10">
      
      {/* Main Content Area (Left) */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">Manage, Track and Monitor all uploaded jobs in real-time.</p>
          </div>
          <button 
            onClick={exportJobs}
            className="bg-white border border-[#10AFA5] text-[#10AFA5] hover:bg-[#F0FDFA] px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <FiDownload className="w-4 h-4" /> Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">{card.label}</p>
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
                  <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-[10px] font-semibold ${card.trendColor}`}>{card.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Job ID, customer or phone..."
                  className="w-full h-10 pl-9 pr-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] outline-none transition-all"
                />
              </div>
            </div>

            {/* Dropdowns */}
            {[
              { label: 'Status', key: 'status', options: ['All Status', 'Pending', 'Assigned', 'In_Progress', 'Completed', 'Failed'] },
              { label: 'Service', key: 'service', options: ['All Services', 'AC Repair', 'Plumbing', 'Electrical'] },
              { label: 'City / Location', key: 'city', options: ['All Cities', 'Mumbai', 'Pune', 'Thane'] },
              { label: 'Priority', key: 'priority', options: ['All Priorities', 'High', 'Medium', 'Low'] },
              { label: 'Batch Upload', key: 'batchId', options: ['All Batches'] },
              { label: 'Payment Status', key: 'paymentStatus', options: ['All Payment Status', 'unpaid', 'deducted', 'pending_deduction'] }
            ].map((f, i) => (
              <div key={i} className="min-w-[140px]">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">{f.label}</label>
                <select 
                  value={filters[f.key]}
                  onChange={(e) => handleFilterChange(f.key, e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 text-sm rounded-lg outline-none focus:ring-1 focus:ring-[#10AFA5] bg-white text-gray-700"
                >
                  {f.options.map(opt => {
                    const val = opt.toLowerCase().includes('all') ? 'all' : opt;
                    return <option key={opt} value={val}>{opt}</option>;
                  })}
                </select>
              </div>
            ))}

            <div className="min-w-[200px]">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className="h-10 px-2 w-full border border-gray-200 text-sm rounded-lg text-gray-600 outline-none" />
                <span className="text-gray-400">-</span>
                <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className="h-10 px-2 w-full border border-gray-200 text-sm rounded-lg text-gray-600 outline-none" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => queryClient.invalidateQueries(['b2bJobsList'])} className="h-10 px-4 border border-[#10AFA5] text-[#10AFA5] flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-[#F0FDFA]">
                <FiFilter className="w-4 h-4" /> Filter
              </button>
              <button onClick={resetFilters} className="h-10 px-4 border border-gray-200 text-gray-600 flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                <FiRefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-6 px-2 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'assigned', 'in progress', 'completed', 'failed/cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`py-3 text-sm font-bold capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-[#10AFA5] text-[#10AFA5]' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab} Jobs
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-visible">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                  <th className="py-4 pl-6 pr-4">Job ID</th>
                  <th className="py-4 px-4">Customer Details</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Assigned Engineer</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Created On</th>
                  <th className="py-4 pr-6 pl-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full mx-auto" /></td></tr>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-4 pl-6 pr-4">
                        <p className="font-bold text-[#10AFA5]">{job.jobId}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Batch: {job.batchId?.batchId || 'Manual'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-800">{job.customerName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{job.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-800 flex items-center gap-1">
                          <FiCheckCircle className="text-[#10AFA5] w-3 h-3" /> {job.service}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <FiMapPin className="text-gray-400 w-3 h-3" /> {job.city}
                        </p>
                        <p className="text-[10px] text-gray-400 pl-4">Pin: {job.pincode}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.priority === 'High' ? 'bg-red-50 text-red-600' :
                          job.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {job.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {job.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <img src={job.assignedTo.profilePic || 'https://via.placeholder.com/30'} alt="Eng" className="w-7 h-7 rounded-full border border-gray-200" />
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">{job.assignedTo.firstName}</p>
                              <p className="text-[10px] text-yellow-500 flex items-center gap-0.5">⭐ {job.assignedTo.averageRating || '4.5'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${getStatusStyle(job.status)}`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[11px] font-bold ${job.paymentStatus === 'deducted' ? 'text-green-600' : 'text-orange-500'}`}>
                          {job.paymentStatus === 'deducted' ? 'Deducted' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <p className="font-medium text-gray-800">{new Date(job.createdAt).toLocaleDateString('en-GB')}</p>
                        <p className="text-gray-400">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="py-4 pr-6 pl-4 text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedJob(job._id)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10AFA5] hover:bg-[#F0FDFA]">
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          {['assigned', 'engineer_on_way', 'in_progress'].includes(job.status) && (
                            <button onClick={() => setTrackingJob(job._id)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50" title="Track Live">
                              <FiNavigation className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="relative">
                            <button onClick={() => setActiveMenu(activeMenu === job._id ? null : job._id)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                              <FiMoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeMenu === job._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                                  <button onClick={() => { setSelectedJob(job._id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5]">View Details</button>
                                  <button className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5]">Download Report</button>
                                  <button className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5]">Support Ticket</button>
                                  {['pending', 'searching_engineer', 'assigned'].includes(job.status) && (
                                    <button onClick={() => { if(window.confirm('Cancel this job?')) cancelJobMutation.mutate(job._id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                      Cancel Job
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={10} className="text-center py-16 text-gray-400 font-medium text-sm">No jobs found matching criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {pagination.total > 0 ? (pagination.page - 1) * itemsPerPage + 1 : 0} to {Math.min(pagination.page * itemsPerPage, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50">«</button>
              <span className="px-4 font-semibold">{currentPage} / {pagination.totalPages || 1}</span>
              <button disabled={currentPage === pagination.totalPages || pagination.totalPages === 0} onClick={() => setCurrentPage(c => c + 1)} className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-80 space-y-6 shrink-0">
        
        {/* Job Status Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
          <h3 className="font-bold text-gray-900 mb-2 text-left">Job Status Overview</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-gray-900">{stats.totalJobs?.toLocaleString() || 0}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                </div>
                <div className="font-bold text-gray-900">{d.value.toLocaleString()} <span className="text-gray-400 font-normal">({stats.totalJobs ? ((d.value / stats.totalJobs) * 100).toFixed(1) : 0}%)</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.location.href='/b2b/bulk-jobs/upload'} className="bg-[#E6F4F2] hover:bg-[#c9ebe7] text-[#10AFA5] p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
              <FiUploadCloud className="w-6 h-6" />
              <span className="text-xs font-bold text-center leading-tight">Upload New Jobs</span>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
              <FiDownload className="w-6 h-6" />
              <span className="text-xs font-bold text-center leading-tight">Download Report</span>
            </button>
            <button onClick={() => window.location.href='/b2b/wallet'} className="bg-green-50 hover:bg-green-100 text-green-600 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
              <FiBriefcase className="w-6 h-6" />
              <span className="text-xs font-bold text-center leading-tight">Wallet & Payments</span>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
              <FiHeadphones className="w-6 h-6" />
              <span className="text-xs font-bold text-center leading-tight">Support Ticket</span>
            </button>
          </div>
        </div>

        {/* Recent Job Activities (Mocked for UI, ideally fetched from a logs API) */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Job Activities</h3>
            <button className="text-[#10AFA5] text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {/* Example static logs mapping to the UI requirement */}
            <div className="relative flex items-start gap-3 z-10">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 border-2 border-white flex justify-center items-center shrink-0 mt-0.5 shadow-sm"><FiCheckCircle className="w-3 h-3" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Job JOB-12500 completed</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Rahul Sharma marked job as completed</p>
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">Today, 11:45 AM</p>
              </div>
            </div>
            <div className="relative flex items-start gap-3 z-10">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex justify-center items-center shrink-0 mt-0.5 shadow-sm"><FiUser className="w-3 h-3" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Engineer assigned</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Amit Singh assigned to JOB-12499</p>
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">Today, 10:30 AM</p>
              </div>
            </div>
            <div className="relative flex items-start gap-3 z-10">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 border-2 border-white flex justify-center items-center shrink-0 mt-0.5 shadow-sm"><FiFileText className="w-3 h-3" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">New job uploaded</p>
                <p className="text-[10px] text-gray-500 mt-0.5">500 new jobs uploaded in batch BJB-2025</p>
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">Today, 09:15 AM</p>
              </div>
            </div>
            <div className="relative flex items-start gap-3 z-10">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 border-2 border-white flex justify-center items-center shrink-0 mt-0.5 shadow-sm"><FiAlertTriangle className="w-3 h-3" /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Job failed</p>
                <p className="text-[10px] text-gray-500 mt-0.5">JOB-12495 marked as failed</p>
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">Yesterday, 09:45 AM</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modals & Drawers */}
      {selectedJob && <JobDetailsDrawer jobId={selectedJob} onClose={() => setSelectedJob(null)} />}
      {trackingJob && <LiveTrackingModal jobId={trackingJob} onClose={() => setTrackingJob(null)} />}
    </div>
  );
};

export default Jobs;
