import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiSearch, FiFilter, FiDownload, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiUploadCloud, 
  FiFileText, FiAlertTriangle, FiList, FiBriefcase, FiEye, 
  FiMoreVertical, FiRotateCw, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import { useSocket } from '../../../../context/SocketContext';

const BulkJobsHistory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rowsFilter, setRowsFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Menu state for actions
  const [activeMenu, setActiveMenu] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleRefetch = () => {
      queryClient.invalidateQueries(['b2bHistoryList']);
      queryClient.invalidateQueries(['b2bBulkStats']);
    };

    socket.on('b2b:batchCreated', handleRefetch);
    socket.on('b2b:batchProcessing', handleRefetch);
    socket.on('b2b:batchCompleted', handleRefetch);
    socket.on('b2b:batchFailed', handleRefetch);

    return () => {
      socket.off('b2b:batchCreated', handleRefetch);
      socket.off('b2b:batchProcessing', handleRefetch);
      socket.off('b2b:batchCompleted', handleRefetch);
      socket.off('b2b:batchFailed', handleRefetch);
    };
  }, [socket, queryClient]);

  // Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ['b2bBulkStats'],
    queryFn: async () => {
      const res = await api.get('/b2b/bulk-jobs/stats');
      return res.data?.stats || {};
    },
    refetchInterval: 30000 // Fallback polling
  });

  // Fetch History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['b2bHistoryList', currentPage, itemsPerPage, statusFilter, rowsFilter, serviceFilter, dateRange, debouncedSearch],
    queryFn: async () => {
      let minRows, maxRows;
      if (rowsFilter === '0-1000') { minRows = 0; maxRows = 1000; }
      else if (rowsFilter === '1001-5000') { minRows = 1001; maxRows = 5000; }
      else if (rowsFilter === '5001+') { minRows = 5001; }

      const res = await api.get('/b2b/bulk-jobs/history', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter || undefined,
          search: debouncedSearch || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          minRows,
          maxRows,
          service: serviceFilter || undefined
        }
      });
      return res.data;
    }
  });

  const batches = historyData?.batches || [];
  const pagination = historyData?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (batchId) => api.delete(`/b2b/bulk-jobs/${batchId}`),
    onSuccess: () => {
      toast.success('Batch deleted successfully');
      queryClient.invalidateQueries(['b2bHistoryList']);
      queryClient.invalidateQueries(['b2bBulkStats']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const retryMutation = useMutation({
    mutationFn: (batchId) => api.post(`/b2b/bulk-jobs/${batchId}/retry`),
    onSuccess: () => {
      toast.success('Batch queued for retry');
      queryClient.invalidateQueries(['b2bHistoryList']);
      queryClient.invalidateQueries(['b2bBulkStats']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to retry')
  });

  const handleDownloadOriginal = async (batchId, fileName) => {
    try {
      const res = await api.get(`/b2b/bulk-jobs/${batchId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleDownloadErrors = async (batchId) => {
    try {
      const res = await api.get(`/b2b/bulk-jobs/errors/${batchId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error_report_${batchId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download error report');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRowsFilter('');
    setServiceFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleActionClick = (batchId) => {
    setActiveMenu(activeMenu === batchId ? null : batchId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Bulk Jobs</span>
            <span>{'>'}</span>
            <span className="text-gray-800 font-medium">Upload History</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload History</h1>
          <p className="text-sm text-gray-500 mt-1">
            View all your bulk job upload history and their status.
          </p>
        </div>
        <Link 
          to="/b2b/bulk-jobs/upload"
          className="bg-[#10AFA5] hover:bg-[#0E9B93] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-teal-500/20"
        >
          <span>+ Upload New File</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Uploads', value: statsData?.totalUploads || 0, icon: <FiUploadCloud className="w-5 h-5 text-[#10AFA5]" />, bg: 'bg-[#E6F4F2]', trend: '↑ 20% from last month', trendColor: 'text-green-600' },
          { label: 'Jobs Uploaded', value: (statsData?.jobsUploaded || 0).toLocaleString(), icon: <FiFileText className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', trend: '↑ 18% from last month', trendColor: 'text-green-600' },
          { label: 'Processing', value: statsData?.processingJobs || 0, icon: <FiRefreshCw className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50', trend: '-' },
          { label: 'Failed Rows', value: (statsData?.failedRows || 0).toLocaleString(), icon: <FiAlertTriangle className="w-5 h-5 text-red-500" />, bg: 'bg-red-50', trend: '↓ 5% from last month', trendColor: 'text-red-500' },
          { label: 'Total Rows', value: (statsData?.totalRows || 0).toLocaleString(), icon: <FiList className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', trend: '-' },
          { label: 'Wallet Balance', value: `₹ ${(statsData?.walletBalance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, icon: <FiBriefcase className="w-5 h-5 text-[#10AFA5]" />, bg: 'bg-[#E6F4F2]', action: 'Top Up Wallet', actionColor: 'text-[#10AFA5]' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">{stat.label}</p>
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="mt-4">
              {stat.trend && stat.trend !== '-' ? (
                <p className={`text-[10px] font-semibold ${stat.trendColor}`}>{stat.trend}</p>
              ) : stat.action ? (
                <Link to="/b2b/wallet" className={`text-[10px] font-semibold ${stat.actionColor} hover:underline flex items-center gap-1`}>
                  <FiUploadCloud className="w-3 h-3" /> {stat.action}
                </Link>
              ) : (
                <p className="text-[10px] font-semibold text-gray-400">-</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Search</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by file name or batch ID..."
              className="w-full h-10 pl-9 pr-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="h-10 px-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none text-gray-600" />
              <span className="text-gray-400">-</span>
              <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="h-10 px-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none text-gray-600" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none text-gray-700 bg-white min-w-[120px]">
              <option value="">All Status</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="validated">Validated</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Rows</label>
            <select value={rowsFilter} onChange={(e) => setRowsFilter(e.target.value)} className="h-10 px-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none text-gray-700 bg-white min-w-[100px]">
              <option value="">All</option>
              <option value="0-1000">0 - 1,000</option>
              <option value="1001-5000">1,001 - 5,000</option>
              <option value="5001+">5,001+</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Services</label>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="h-10 px-3 border border-gray-200 text-sm rounded-lg focus:ring-1 focus:ring-[#10AFA5] focus:border-[#10AFA5] outline-none text-gray-700 bg-white min-w-[130px]">
              <option value="">All Services</option>
              <option value="AC Repair">AC Repair</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          <div className="flex gap-2 h-10 items-end">
            <button onClick={() => setCurrentPage(1)} className="h-10 px-4 border border-[#10AFA5] text-[#10AFA5] flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-[#F0FDFA] transition-colors">
              <FiFilter className="w-4 h-4" /> Filter
            </button>
            <button onClick={handleResetFilters} className="h-10 px-4 border border-gray-200 text-gray-600 flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <FiRefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                <th className="py-4 pl-6 pr-4">Batch ID</th>
                <th className="py-4 px-4">File Name</th>
                <th className="py-4 px-4">Upload Date</th>
                <th className="py-4 px-4">Total Rows</th>
                <th className="py-4 px-4">Valid Rows</th>
                <th className="py-4 px-4">Invalid Rows</th>
                <th className="py-4 px-4">Duplicates</th>
                <th className="py-4 px-4">Estimated Cost</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 pr-6 pl-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isHistoryLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    <FiRefreshCw className="w-6 h-6 animate-spin mx-auto text-[#10AFA5] mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : batches.length > 0 ? (
                batches.map((batch) => {
                  const dateObj = new Date(batch.createdAt);
                  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                  return (
                    <tr key={batch._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-4 pl-6 pr-4 font-medium text-gray-700">
                        {batch.batchId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-green-600 text-[10px] font-bold">
                            XE
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{batch.fileName}</p>
                            <p className="text-xs text-gray-400">24.5 KB</p> 
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-800">{formattedDate}, {formattedTime}</p>
                        <p className="text-xs text-gray-400">by Admin</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">
                        {batch.totalRows.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-green-600">
                        {batch.validRows.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-red-500">
                        {batch.invalidRows.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-medium text-orange-500">
                        {batch.duplicates.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-800">₹ {(batch.estimatedCost || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        <p className="text-[10px] text-gray-400">(₹ {batch.perJobCharge?.toFixed(2) || '0.00'} per job)</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          batch.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                          (batch.status === 'failed' || batch.status === 'cancelled') ? 'bg-red-50 text-red-600 border border-red-100' :
                          batch.status === 'processing' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          batch.status === 'validated' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 pr-6 pl-4 text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            to={`/b2b/bulk-jobs/${batch._id}`}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10AFA5] hover:border-[#10AFA5] hover:bg-[#F0FDFA] transition-all"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDownloadOriginal(batch._id, batch.fileName)}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#10AFA5] hover:border-[#10AFA5] hover:bg-[#F0FDFA] transition-all"
                            title="Download Original"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => handleActionClick(batch._id)}
                              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            
                            {activeMenu === batch._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1 overflow-hidden shadow-xl">
                                  {batch.status === 'failed' && (
                                    <>
                                      <button onClick={() => { handleDownloadErrors(batch._id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5] flex items-center gap-2 font-medium">
                                        <FiDownload className="w-4 h-4" /> Error Report
                                      </button>
                                      <button onClick={() => { retryMutation.mutate(batch._id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5] flex items-center gap-2 font-medium">
                                        <FiRotateCw className="w-4 h-4" /> Retry Upload
                                      </button>
                                    </>
                                  )}
                                  {batch.status === 'validated' && (
                                    <button onClick={() => { localStorage.setItem('activeB2BBatchId', batch._id); navigate('/b2b/bulk-jobs'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10AFA5] flex items-center gap-2 font-medium">
                                      <FiCheckCircle className="w-4 h-4" /> Continue Review
                                    </button>
                                  )}
                                  {['draft', 'validated', 'failed'].includes(batch.status) && (
                                    <button onClick={() => { if(window.confirm('Delete this batch?')) deleteMutation.mutate(batch._id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                                      <FiTrash2 className="w-4 h-4" /> Delete Draft
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400 font-medium text-sm">
                    No spreadsheet records matched your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {pagination.total > 0 ? (pagination.page - 1) * itemsPerPage + 1 : 0} to {Math.min(pagination.page * itemsPerPage, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
              >
                «
              </button>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const p = idx + 1;
                if (p === 1 || p === pagination.totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <button 
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded border flex items-center justify-center transition-colors font-medium ${currentPage === p ? 'bg-[#10AFA5] text-white border-[#10AFA5]' : 'bg-white border-gray-200 hover:border-[#10AFA5] hover:text-[#10AFA5]'}`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                  return <span key={p} className="text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setCurrentPage(c => c + 1)}
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              <button 
                disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setCurrentPage(pagination.totalPages)}
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center hover:border-[#10AFA5] hover:text-[#10AFA5] disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
              >
                »
              </button>
            </div>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="h-8 px-2 rounded border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#10AFA5]"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default BulkJobsHistory;
