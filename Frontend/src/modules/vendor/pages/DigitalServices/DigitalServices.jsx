import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiPlus, FiDownload,
  FiCode, FiSmartphone, FiDatabase, FiTrendingUp, FiFigma, FiTool, FiCloud, FiMoreHorizontal,
  FiEye, FiEdit2, FiCopy, FiTrash2, FiStar, FiChevronLeft, FiChevronRight,
  FiBox, FiCheckSquare, FiDollarSign, FiShoppingBag, FiArrowUpRight, FiArrowDownRight
} from 'react-icons/fi';
import api from '../../../../services/api';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const iconMap = {
  FiCode: <FiCode />,
  FiSmartphone: <FiSmartphone />,
  FiDatabase: <FiDatabase />,
  FiTrendingUp: <FiTrendingUp />,
  FiFigma: <FiFigma />,
  FiTool: <FiTool />,
  FiCloud: <FiCloud />,
  FiMoreHorizontal: <FiMoreHorizontal />
};

export default function DigitalServices() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [services, setServices] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categoriesConfig, setCategoriesConfig] = useState([]);
  const [statusesConfig, setStatusesConfig] = useState([]);
  
  // Filters & State
  const [activeTab, setActiveTab] = useState('All Services');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/vendors/digital-services/overview');
      if(res.data.success) {
        setOverview(res.data.data);
      }
    } catch(err) { console.error('Error fetching overview', err); }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('/vendors/digital-services/config');
      if(res.data.success) {
        setCategoriesConfig(res.data.data.categories);
        setStatusesConfig(res.data.data.statuses);
      }
    } catch(err) { console.error('Error fetching config', err); }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/digital-services', {
        params: { 
          page, 
          limit: itemsPerPage, 
          search, 
          category: activeTab !== 'All Services' ? activeTab : (categoryFilter !== 'All Categories' ? categoryFilter : ''), 
          status: statusFilter 
        }
      });
      if(res.data.success) {
        setServices(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch(err) { console.error('Error fetching services', err); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/vendors/digital-services/orders/recent');
      if(res.data.success) {
        setRecentOrders(res.data.data);
      }
    } catch(err) { console.error('Error fetching orders', err); }
  };

  useEffect(() => {
    fetchConfig();
    fetchOverview();
    fetchOrders();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('vendorAccessToken') || sessionStorage.getItem('vendorAccessToken') }
    });

    socket.on('digital_service:created', () => { fetchServices(); fetchOverview(); });
    socket.on('digital_service:updated', () => { fetchServices(); fetchOverview(); });
    
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [page, activeTab, search, statusFilter, categoryFilter, itemsPerPage]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const renderGrowth = (str) => {
    if(!str) return null;
    const isPositive = str.startsWith('+');
    return (
      <p className={`text-xs font-semibold flex items-center mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {isPositive ? <FiArrowUpRight className="mr-1"/> : <FiArrowDownRight className="mr-1"/>}
        {str.replace('+','')} <span className="text-slate-400 font-normal ml-1">vs last month</span>
      </p>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20 p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f172a] leading-tight">Services</h1>
          <p className="text-[13px] text-slate-500 mt-1">Home &gt; Services</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all">
            <FiDownload className="mr-2" /> Export Services
          </button>
          <button className="flex items-center px-4 py-2.5 bg-[#00a78e] text-white rounded-lg text-sm font-semibold hover:bg-[#008f79] shadow-sm transition-all">
            <FiPlus className="mr-2" /> Add New Service
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {[
          { label: 'Total Services', value: overview?.stats?.totalServices || 0, icon: <FiBox className="text-[#8b5cf6]" />, bg: 'bg-[#8b5cf6]/10', growth: overview?.stats?.growth?.totalServices },
          { label: 'Active Services', value: overview?.stats?.activeServices || 0, icon: <FiCheckSquare className="text-[#10b981]" />, bg: 'bg-[#10b981]/10', growth: overview?.stats?.growth?.activeServices },
          { label: 'Featured Services', value: overview?.stats?.featuredServices || 0, icon: <FiStar className="text-[#f59e0b]" />, bg: 'bg-[#f59e0b]/10', growth: overview?.stats?.growth?.featuredServices },
          { label: 'Total Orders', value: overview?.stats?.totalOrders || 0, icon: <FiShoppingBag className="text-[#3b82f6]" />, bg: 'bg-[#3b82f6]/10', growth: overview?.stats?.growth?.totalOrders },
          { label: 'Total Revenue', value: formatCurrency(overview?.stats?.totalRevenue || 0), icon: <FiDollarSign className="text-[#00a78e]" />, bg: 'bg-[#00a78e]/10', growth: overview?.stats?.growth?.totalRevenue }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-start space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className={`p-3.5 rounded-xl ${stat.bg} text-2xl shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[13px] font-medium text-slate-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-[#0f172a]">{stat.value}</p>
              {renderGrowth(stat.growth)}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Tabs */}
      <div className="border-b border-slate-200 mt-8">
        <div className="flex space-x-8 overflow-x-auto no-scrollbar">
          <button 
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'All Services' ? 'text-[#00a78e] border-b-[3px] border-[#00a78e]' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => { setActiveTab('All Services'); setPage(1); }}
          >
            All Services
          </button>
          {categoriesConfig.map(cat => (
            <button 
              key={cat._id}
              className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === cat.name ? 'text-[#00a78e] border-b-[3px] border-[#00a78e]' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setActiveTab(cat.name); setPage(1); }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar (Search, Filter, View Toggles) */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center space-x-3 w-full max-w-2xl">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#00a78e] focus:border-[#00a78e] outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00a78e] shadow-sm cursor-pointer"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="All Categories">All Categories</option>
              {categoriesConfig.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00a78e] shadow-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="All Status">All Status</option>
              {statusesConfig.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button 
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'grid' ? 'bg-[#00a78e]/10 text-[#00a78e]' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setViewMode('grid')}
          >
            <FiGrid className="mr-1.5" /> Grid View
          </button>
          <button 
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-[#00a78e]/10 text-[#00a78e]' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setViewMode('list')}
          >
            <FiList className="mr-1.5" /> List View
          </button>
        </div>
      </div>

      {/* Services Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-[#00a78e]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a78e]"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FiBox className="text-3xl text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No services found</h3>
          <p className="text-slate-500 text-sm max-w-md">We couldn't find any services matching your current filters. Try adjusting your search or add a new service.</p>
          <button className="mt-6 px-6 py-2.5 bg-[#00a78e] text-white rounded-lg text-sm font-semibold hover:bg-[#008f79] transition-all">
            Add New Service
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {services.map(service => (
                <div key={service._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${service.categoryId?.color || '#00a78e'}15`, color: service.categoryId?.color || '#00a78e' }}>
                        <div className="text-2xl">{iconMap[service.iconUrl] || <FiBox />}</div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-wide uppercase mb-1" style={{ color: service.categoryId?.color || '#00a78e' }}>{service.categoryId?.name}</p>
                        <h3 className="font-bold text-[#0f172a] text-[17px] leading-tight mb-2">{service.title}</h3>
                        <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2">{service.shortDescription}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-[13px] text-slate-500 mb-4">Starting from <span className="text-[#0f172a] font-bold text-lg ml-1">{service.isCustomPricing ? 'Custom' : formatCurrency(service.basePrice)}</span></p>
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Orders</p>
                          <p className="font-bold text-[#0f172a]">{service.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Rating</p>
                          <p className="font-bold text-[#0f172a] flex items-center"><FiStar className="text-[#f59e0b] mr-1.5 w-3.5 h-3.5 fill-current"/> {service.rating}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Revenue</p>
                          <p className="font-bold text-[#0f172a]">{formatCurrency(service.totalRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${service.status === 'Active' ? 'bg-[#10b981]' : service.status === 'Featured' ? 'bg-[#f59e0b]' : 'bg-slate-400'}`}></span>
                      <span className="text-[13px] font-bold text-slate-700">{service.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#00a78e] hover:border-[#00a78e] hover:bg-[#00a78e]/5 transition-colors bg-white"><FiEdit2 className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#00a78e] hover:border-[#00a78e] hover:bg-[#00a78e]/5 transition-colors bg-white"><FiEye className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors bg-white"><FiMoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[30%]">Service Info</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pricing</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Orders</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Revenue</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(service => (
                      <tr key={service._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${service.categoryId?.color || '#00a78e'}15`, color: service.categoryId?.color || '#00a78e' }}>
                              <div className="text-xl">{iconMap[service.iconUrl] || <FiBox />}</div>
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a] text-[14px] leading-tight mb-1 truncate max-w-[250px]" title={service.title}>{service.title}</p>
                              <div className="flex items-center text-[12px] font-medium text-slate-500">
                                <FiStar className="text-[#f59e0b] mr-1 w-3 h-3 fill-current"/> {service.rating} Rating
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md" style={{ backgroundColor: `${service.categoryId?.color || '#00a78e'}15`, color: service.categoryId?.color || '#00a78e' }}>
                            {service.categoryId?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-[#0f172a]">
                          {service.isCustomPricing ? 'Custom' : formatCurrency(service.basePrice)}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-slate-700 text-center">
                          {service.totalOrders}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-[#0f172a] text-right">
                          {formatCurrency(service.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${service.status === 'Active' ? 'bg-[#10b981]' : service.status === 'Featured' ? 'bg-[#f59e0b]' : 'bg-slate-400'}`}></span>
                            <span className="text-[13px] font-bold text-slate-700">{service.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#00a78e] hover:border-[#00a78e] hover:bg-[#00a78e]/5 transition-colors bg-white"><FiEdit2 className="w-3.5 h-3.5" /></button>
                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#00a78e] hover:border-[#00a78e] hover:bg-[#00a78e]/5 transition-colors bg-white"><FiEye className="w-3.5 h-3.5" /></button>
                            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors bg-white"><FiMoreHorizontal className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Pagination Controls */}
          <div className="flex justify-between items-center pt-6 pb-2">
            <p className="text-[13px] font-medium text-slate-500">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, overview?.stats?.totalServices || 0)} of {overview?.stats?.totalServices || 0} services
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 text-slate-400 hover:text-[#00a78e] disabled:opacity-30 disabled:hover:text-slate-400"><FiChevronLeft className="w-5 h-5" /></button>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-md text-[13px] font-bold flex items-center justify-center transition-colors ${page === i+1 ? 'bg-[#00a78e]/10 text-[#00a78e]' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 text-slate-400 hover:text-[#00a78e] disabled:opacity-30 disabled:hover:text-slate-400"><FiChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <select 
                  className="appearance-none text-[13px] font-bold text-slate-700 focus:outline-none cursor-pointer bg-transparent pr-4"
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                >
                  <option value={8}>8 / page</option>
                  <option value={16}>16 / page</option>
                  <option value={24}>24 / page</option>
                </select>
                <FiChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        
        {/* Top Performing Services */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-[17px] text-[#0f172a] mb-6">Top Performing Services</h3>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 mb-4">
              <span className="w-[45%]">Service Name</span>
              <span className="w-[15%] text-center">Orders</span>
              <span className="w-[25%] text-right">Revenue</span>
              <span className="w-[15%] text-right">Rating</span>
            </div>
            <div className="space-y-5">
              {overview?.topPerforming?.map((ts, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="w-[45%] flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500 text-sm">
                      {iconMap[ts.iconUrl] || <FiBox />}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 truncate" title={ts.title}>{ts.title}</span>
                  </div>
                  <span className="w-[15%] text-center text-[13px] font-bold text-slate-700">{ts.totalOrders}</span>
                  <span className="w-[25%] text-right text-[13px] font-bold text-slate-700">{formatCurrency(ts.totalRevenue)}</span>
                  <span className="w-[15%] text-right flex items-center justify-end text-[13px] font-bold text-slate-700">
                    <FiStar className="text-[#f59e0b] mr-1.5 w-3.5 h-3.5 fill-current"/> {ts.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Categories Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-[17px] text-[#0f172a] mb-6">Service Categories</h3>
          <div className="flex items-center flex-1">
            <div className="w-[45%] h-full relative flex items-center justify-center">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={overview?.categoryDistribution || []} 
                      cx="50%" cy="50%" 
                      innerRadius={55} outerRadius={80} 
                      paddingAngle={3} 
                      dataKey="value"
                      stroke="none"
                    >
                      {overview?.categoryDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#00a78e'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-[#0f172a] leading-none">{overview?.stats?.totalServices || 0}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
              </div>
            </div>
            <div className="w-[55%] pl-6">
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {overview?.categoryDistribution?.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 mr-3 shadow-sm" style={{ backgroundColor: cat.color }}></span>
                      <span className="text-[12px] font-semibold text-slate-600 truncate group-hover:text-slate-800 transition-colors">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[13px] font-bold text-slate-700">{cat.value}</span>
                      <span className="text-[11px] font-medium text-slate-400 w-10 text-right">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Service Orders */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[17px] text-[#0f172a]">Recent Service Orders</h3>
            <button className="text-[12px] font-bold text-[#00a78e] hover:text-[#008f79] transition-colors">View All Orders</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
            <div className="space-y-5">
              {recentOrders.map((order, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 w-[50%]">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                      <FiBox className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-[13px] font-bold text-slate-700 truncate" title={order.serviceId?.title || 'Custom Service'}>{order.serviceId?.title || 'Custom Service'}</p>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="w-[25%] text-[13px] font-bold text-slate-700 text-center">
                    {formatCurrency(order.amount)}
                  </div>
                  <div className="w-[25%] flex justify-end">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md 
                      ${order.status === 'Completed' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                        order.status === 'In Progress' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 
                        order.status === 'New' || order.status === 'Pending' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-slate-100 text-slate-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline fallback for FiChevronDown if not imported correctly
const FiChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
