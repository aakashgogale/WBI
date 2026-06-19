import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiCalendar, FiDownload, FiMoreVertical,
  FiClock, FiCheckCircle, FiBox, FiTruck, FiXCircle, FiRefreshCw, FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { adminBookingService } from '../../../../services/adminBookingService';
import { getDashboardStats } from '../../../../services/adminDashboardService';
import adminWorkerService from '../../../../services/adminWorkerService';
import { useSocket } from '../../../../context/SocketContext';

const BookingStatsCard = ({ title, count, icon: Icon, colorClass, bgClass }) => (
  <div className={`p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between ${bgClass}`}>
    <div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{count}</p>
    </div>
    <div className={`w-12 h-12 rounded-full opacity-10 -mr-3 -mb-3 ${colorClass.replace('text-', 'bg-')}`}></div>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'reassign' | 'details' | 'track' | 'status' | 'payment' | 'refund' | 'customer' | 'worker' | 'logs' | 'note'
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [workersList, setWorkersList] = useState([]);

  const openActionModal = async (action, booking) => {
    setSelectedBooking(booking);
    setActiveModal(action);
    setModalData(null);
    setModalLoading(true);
    setActiveDropdown(null);

    try {
      if (action === 'assign' || action === 'track') {
        const res = await adminBookingService.getMatchingStatus(booking._id);
        if (res.success) {
          setModalData(res.data);
        }
      } else if (action === 'reassign') {
        const res = await adminWorkerService.getAllWorkers();
        if (res.success) {
          setWorkersList(res.data.data || res.data || []);
        }
      } else if (action === 'logs') {
        const res = await adminBookingService.getLogs(booking._id);
        if (res.success) {
          setModalData(res.data);
        }
      } else if (action === 'payment') {
        const res = await adminBookingService.getPayment(booking._id);
        if (res.success) {
          setModalData(res.data);
        }
      } else if (action === 'details') {
        const res = await adminBookingService.getBookingById(booking._id);
        if (res.success) {
          setModalData(res.data);
        }
      } else if (action === 'status') {
        setStatusToUpdate(booking.status);
      }
    } catch (error) {
      console.error(`Error loading modal data for ${action}:`, error);
      toast.error('Failed to load details');
    } finally {
      setModalLoading(false);
    }
  };

  const socket = useSocket();

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Bookings immediately
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        startDate,
        endDate
      };
      if (statusFilter !== 'All Status') {
        params.status = statusFilter.toUpperCase().replace(' ', '_');
      }

      const res = await adminBookingService.getAllBookings(params);
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await getDashboardStats();
      if (statsRes.success) {
        const s = statsRes.data.stats;
        setStats({
          pending: s.pendingBookings || 0,
          confirmed: 0,
          inProgress: 0,
          completed: s.completedBookings || 0,
          cancelled: s.cancelledBookings || 0,
          total: s.totalBookings || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Socket Listener for Dynamic Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    const handleRealTimeUpdate = (data) => {
      // Re-fetch data softly to keep the UI perfectly synced
      fetchData();
      fetchStats();
    };

    socket.on('admin:bookingSearching', handleRealTimeUpdate);
    socket.on('admin:workerRequestSent', handleRealTimeUpdate);
    socket.on('admin:workerAccepted', handleRealTimeUpdate);
    socket.on('admin:assignmentFailed', handleRealTimeUpdate);
    socket.on('admin:urgent_booking_alert', handleRealTimeUpdate);

    return () => {
      socket.off('admin:bookingSearching', handleRealTimeUpdate);
      socket.off('admin:workerRequestSent', handleRealTimeUpdate);
      socket.off('admin:workerAccepted', handleRealTimeUpdate);
      socket.off('admin:assignmentFailed', handleRealTimeUpdate);
      socket.off('admin:urgent_booking_alert', handleRealTimeUpdate);
    };
  }, [socket, page, debouncedSearch, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Service', 'Total', 'Status', 'Date'];
    const rows = bookings.map(b => [
      b.bookingNumber,
      b.userId?.name || 'Unknown',
      b.serviceId?.title || 'Service',
      b.finalAmount,
      b.status,
      new Date(b.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <BookingStatsCard title="Awaiting" count={stats.pending} icon={FiClock} bgClass="bg-yellow-50" colorClass="text-yellow-600" />
        <BookingStatsCard title="Confirmed" count={stats.pending} icon={FiCheckCircle} bgClass="bg-blue-50" colorClass="text-blue-600" />
        <BookingStatsCard title="In Progress" count={stats.inProgress} icon={FiBox} bgClass="bg-purple-50" colorClass="text-purple-600" />
        <BookingStatsCard title="Completed" count={stats.completed} icon={FiTruck} bgClass="bg-green-50" colorClass="text-green-600" />
        <BookingStatsCard title="Delivered" count={stats.completed} icon={FiCheckCircle} bgClass="bg-emerald-50" colorClass="text-emerald-600" />
        <BookingStatsCard title="Cancelled" count={stats.cancelled} icon={FiXCircle} bgClass="bg-red-50" colorClass="text-red-600" />
        <BookingStatsCard title="Returned" count={0} icon={FiRefreshCw} bgClass="bg-orange-50" colorClass="text-orange-600" />
        <BookingStatsCard title="Total Orders" count={stats.total} icon={FiShoppingBag} bgClass="bg-gray-50" colorClass="text-gray-600" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-3 justify-between items-center">
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:border-green-500 cursor-pointer"
          >
            <option>All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
            <FiCalendar className="text-gray-400 w-3.5 h-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[11px] text-gray-600 focus:outline-none w-20"
            />
            <span className="text-gray-400 text-[10px]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[11px] text-gray-600 focus:outline-none w-20"
            />
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-green-200"
          >
            <FiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total (₹)</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-xs text-gray-500">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-xs text-gray-500">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-xs">#{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{booking.userId?.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-400">{booking.userId?.phone || booking.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-blue-600 text-[11px] font-bold">
                        {booking.items?.length || 1} items
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-xs">₹{booking.finalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                            ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                              booking.status === 'worker_assigned' ? 'bg-blue-100 text-blue-700' :
                                booking.status === 'searching_worker' ? 'bg-cyan-100 text-cyan-700' :
                                  'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-gray-600 capitalize font-medium">{booking.paymentMethod?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-600 font-medium">
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === booking._id ? null : booking._id);
                        }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeDropdown === booking._id && (
                        <div className="absolute right-8 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 text-left">
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('assign', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiCheckCircle className="w-3 h-3" /> Assign Provider
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('details', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiBox className="w-3 h-3" /> View Details
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('track', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiClock className="w-3 h-3" /> Track Booking
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('reassign', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiRefreshCw className="w-3 h-3" /> Reassign Worker
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('status', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiBox className="w-3 h-3" /> Update Status
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('payment', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiShoppingBag className="w-3 h-3" /> View Payment
                          </button>
                          
                          <div className="h-px bg-gray-100 my-1"></div>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('refund', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiRefreshCw className="w-3 h-3" /> Refund / Hold
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('customer', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiSearch className="w-3 h-3" /> Contact Customer
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('worker', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiSearch className="w-3 h-3" /> Contact Worker
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('logs', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiSearch className="w-3 h-3" /> View Logs
                          </button>
                          
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openActionModal('note', booking); }}
                            className="w-full px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiCheckCircle className="w-3 h-3" /> Add Admin Note
                          </button>
                          
                          <div className="h-px bg-gray-100 my-1"></div>
                          
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedBookingForCancel(booking);
                              setShowCancelModal(true);
                              setActiveDropdown(null); 
                            }} 
                            className="w-full px-4 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <FiXCircle className="w-3 h-3" /> Cancel Booking
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && bookings.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Showing {bookings.length} of {stats.total} entries</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-white transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <FiXCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">Cancel Booking</h3>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">#{selectedBookingForCancel?.bookingNumber || selectedBookingForCancel?._id?.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Reason for cancellation</label>
                  <textarea 
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all min-h-[100px] resize-none"
                    placeholder="Enter reason..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellationReason('');
                      setSelectedBookingForCancel(null);
                    }}
                    className="py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button 
                    onClick={async () => {
                      if (!cancellationReason.trim()) {
                        toast.error('Please provide a reason');
                        return;
                      }
                      try {
                        toast.loading('Cancelling...', { id: 'cancel' });
                        await adminBookingService.cancelBooking(selectedBookingForCancel._id, cancellationReason);
                        toast.success('Booking cancelled successfully', { id: 'cancel' });
                        setShowCancelModal(false);
                        setCancellationReason('');
                        setSelectedBookingForCancel(null);
                        fetchData();
                      } catch (error) {
                        toast.error(error.message || 'Failed to cancel', { id: 'cancel' });
                      }
                    }}
                    className="py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md active:scale-95 transition-all"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Modals System */}
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-gray-800 text-sm uppercase tracking-wide">
                  {activeModal === 'assign' && 'Assign Provider'}
                  {activeModal === 'reassign' && 'Reassign Worker'}
                  {activeModal === 'details' && 'Booking Details'}
                  {activeModal === 'track' && 'Track Proximity'}
                  {activeModal === 'status' && 'Update Booking Status'}
                  {activeModal === 'payment' && 'Payment Information'}
                  {activeModal === 'refund' && 'Payment Actions'}
                  {activeModal === 'customer' && 'Contact Customer'}
                  {activeModal === 'worker' && 'Contact Technician'}
                  {activeModal === 'logs' && 'Booking Action Logs'}
                  {activeModal === 'note' && 'Add Internal Note'}
                </h3>
                <button 
                  type="button"
                  onClick={() => { setActiveModal(null); setSelectedBooking(null); setModalData(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 overflow-y-auto text-xs text-gray-700 space-y-4">
                {modalLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* Assign Provider Modal */}
                    {activeModal === 'assign' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-100/50 mb-2">
                          <div>
                            <h4 className="font-bold text-green-900">Auto Assign System</h4>
                            <p className="text-[10px] text-green-600 font-medium">Trigger background search queue</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading('Starting auto-assign...', { id: 'auto' });
                                await adminBookingService.autoAssignProvider(selectedBooking._id);
                                toast.success('Search started in background!', { id: 'auto' });
                                setActiveModal(null);
                                fetchData();
                              } catch (err) {
                                toast.error(err.message || 'Failed to auto-assign', { id: 'auto' });
                              }
                            }}
                            className="px-3 py-1.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all text-[10px]"
                          >
                            Trigger Auto
                          </button>
                        </div>

                        <h4 className="font-black text-gray-800 uppercase tracking-wider text-[10px] border-b pb-1">Nearby Proximity Candidates ({modalData?.workersFound || 0})</h4>
                        {modalData?.eligibleWorkers && modalData.eligibleWorkers.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {modalData.eligibleWorkers.map((worker) => (
                              <div key={worker._id} className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between hover:bg-gray-100/50 transition-all">
                                <div>
                                  <p className="font-bold text-gray-900">{worker.name}</p>
                                  <p className="text-[10px] text-gray-400">{worker.phone} • ★ {worker.rating || 'N/A'}</p>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 ${worker.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{worker.status}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      toast.loading('Assigning technician...', { id: 'assign_man' });
                                      await adminBookingService.assignWorker(selectedBooking._id, worker._id);
                                      toast.success('Technician assigned successfully!', { id: 'assign_man' });
                                      setActiveModal(null);
                                      fetchData();
                                    } catch (err) {
                                      toast.error(err.message || 'Assignment failed', { id: 'assign_man' });
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-[10px]"
                                >
                                  Assign
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">No matching candidates found in database logs.</p>
                        )}
                      </div>
                    )}

                    {/* Reassign Worker Modal */}
                    {activeModal === 'reassign' && (
                      <div className="space-y-3">
                        <h4 className="font-black text-gray-800 uppercase tracking-wider text-[10px] border-b pb-1">System Technicians ({workersList.length})</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {workersList.map((worker) => (
                            <div key={worker._id} className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between">
                              <div>
                                <p className="font-bold text-gray-900">{worker.name}</p>
                                <p className="text-[10px] text-gray-400">{worker.phone} • Experience: {worker.experience || 'N/A'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    toast.loading('Reassigning technician...', { id: 'reassign_man' });
                                    await adminBookingService.reassignWorker(selectedBooking._id, worker._id);
                                    toast.success('Technician reassigned successfully!', { id: 'reassign_man' });
                                    setActiveModal(null);
                                    fetchData();
                                  } catch (err) {
                                    toast.error(err.message || 'Reassignment failed', { id: 'reassign_man' });
                                  }
                                }}
                                className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-[10px]"
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Details Modal */}
                    {activeModal === 'details' && modalData && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border">
                          <p><strong>Booking Number:</strong> #{modalData.bookingNumber}</p>
                          <p><strong>Customer:</strong> {modalData.userId?.name || 'Unknown'} ({modalData.userId?.phone || 'N/A'})</p>
                          <p><strong>Email:</strong> {modalData.userId?.email || 'N/A'}</p>
                          <p><strong>Service:</strong> {modalData.serviceName}</p>
                          <p><strong>Scheduled Slot:</strong> {new Date(modalData.scheduledDate).toLocaleDateString()} at {modalData.scheduledTime}</p>
                          <p><strong>Final Amount:</strong> ₹{modalData.finalAmount}</p>
                          <p><strong>Booking Status:</strong> <span className="uppercase font-bold text-green-600">{modalData.status}</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border">
                          <p className="font-bold border-b pb-1 text-gray-800 uppercase text-[9px] tracking-wider">Address Details</p>
                          <p>{modalData.address?.addressLine1}, {modalData.address?.addressLine2}</p>
                          <p>{modalData.address?.city}, {modalData.address?.state} - {modalData.address?.pincode}</p>
                        </div>
                        {modalData.workerId && (
                          <div className="bg-blue-50 p-3 rounded-xl space-y-1.5 border border-blue-100">
                            <p className="font-bold text-blue-900 uppercase text-[9px] tracking-wider">Assigned Technician</p>
                            <p><strong>Name:</strong> {modalData.workerId.name}</p>
                            <p><strong>Phone:</strong> {modalData.workerId.phone}</p>
                            <p><strong>Rating:</strong> ★ {modalData.workerId.rating || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Track Proximity Modal */}
                    {activeModal === 'track' && modalData && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-xl space-y-2 border">
                          <p><strong>Proximity Status:</strong> <span className="uppercase font-bold text-indigo-600">{modalData.matchingStatus}</span></p>
                          <p><strong>Radius Scanned:</strong> {modalData.currentRadius} KM</p>
                          <p><strong>Total Broadcast Attempts:</strong> {modalData.requestsSent}</p>
                          <p><strong>Last Attempt:</strong> <span className="font-bold text-gray-800">{modalData.lastAttemptStatus}</span></p>
                        </div>
                        <h4 className="font-black text-gray-800 uppercase tracking-wider text-[10px] border-b pb-1">Historical Routing Pipeline ({modalData.attempts?.length || 0})</h4>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {modalData.attempts && modalData.attempts.length > 0 ? (
                            modalData.attempts.map((att, index) => (
                              <div key={index} className="p-2 border bg-gray-50 rounded-lg flex justify-between items-center text-[10px]">
                                <div>
                                  <p className="font-bold text-gray-700">{att.workerId?.name || 'Worker ID: ' + att.workerId}</p>
                                  <p className="text-gray-400">Radius: {att.radiusKm} KM • Round: {att.roundNumber}</p>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] ${att.status === 'accepted' ? 'bg-green-100 text-green-700' : att.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{att.status}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-center py-2">No broadcast attempts logged yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Update Status Modal */}
                    {activeModal === 'status' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">Select Booking Status</label>
                          <select
                            value={statusToUpdate}
                            onChange={(e) => setStatusToUpdate(e.target.value)}
                            className="w-full border rounded-xl p-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="searching_worker">Searching Worker</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              toast.loading('Updating booking status...', { id: 'status_update' });
                              await adminBookingService.updateStatus(selectedBooking._id, statusToUpdate);
                              toast.success('Status updated successfully!', { id: 'status_update' });
                              setActiveModal(null);
                              fetchData();
                            } catch (err) {
                              toast.error(err.message || 'Failed to update status', { id: 'status_update' });
                            }
                          }}
                          className="w-full py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all text-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}

                    {/* View Payment Modal */}
                    {activeModal === 'payment' && modalData && (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border">
                          <p className="flex justify-between"><span>Base Price:</span> <strong>₹{modalData.basePrice}</strong></p>
                          <p className="flex justify-between"><span>Tax:</span> <strong>₹{modalData.tax}</strong></p>
                          <p className="flex justify-between"><span>Visiting Charges:</span> <strong>₹{modalData.visitingCharges}</strong></p>
                          <p className="flex justify-between"><span>Penalty:</span> <strong>₹{modalData.penalty}</strong></p>
                          <p className="flex justify-between text-red-500"><span>Discount:</span> <strong>-₹{modalData.discount}</strong></p>
                          <div className="h-px bg-gray-200 my-1"></div>
                          <p className="flex justify-between text-sm font-bold text-gray-900"><span>Total Amount:</span> <span>₹{modalData.finalAmount}</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border">
                          <p><strong>Payment Status:</strong> <span className={`uppercase font-bold ${modalData.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{modalData.paymentStatus}</span></p>
                          <p><strong>Payment Method:</strong> <span className="uppercase">{modalData.paymentMethod || 'N/A'}</span></p>
                          <p><strong>Transaction/Payment ID:</strong> {modalData.paymentId || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Refund / Hold Modal */}
                    {activeModal === 'refund' && (
                      <div className="space-y-3">
                        <p className="text-gray-500 text-[10px] uppercase font-bold text-center">Manage Financial Actions for Payment</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading('Initiating refund...', { id: 'payment' });
                                await adminBookingService.paymentAction(selectedBooking._id, 'refund');
                                toast.success('Payment refunded!', { id: 'payment' });
                                setActiveModal(null);
                                fetchData();
                              } catch (err) {
                                toast.error(err.message || 'Action failed', { id: 'payment' });
                              }
                            }}
                            className="py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-all"
                          >
                            Refund
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading('Holding payment...', { id: 'payment' });
                                await adminBookingService.paymentAction(selectedBooking._id, 'hold');
                                toast.success('Payment held!', { id: 'payment' });
                                setActiveModal(null);
                                fetchData();
                              } catch (err) {
                                toast.error(err.message || 'Action failed', { id: 'payment' });
                              }
                            }}
                            className="py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 font-bold rounded-lg transition-all"
                          >
                            Hold
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                toast.loading('Releasing payment...', { id: 'payment' });
                                await adminBookingService.paymentAction(selectedBooking._id, 'release');
                                toast.success('Payment released!', { id: 'payment' });
                                setActiveModal(null);
                                fetchData();
                              } catch (err) {
                                toast.error(err.message || 'Action failed', { id: 'payment' });
                              }
                            }}
                            className="py-2 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-lg transition-all"
                          >
                            Release
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Contact Customer Modal */}
                    {activeModal === 'customer' && (
                      <div className="space-y-3 text-center">
                        <div className="bg-gray-50 p-4 rounded-xl border">
                          <h4 className="font-bold text-gray-900 text-sm">{selectedBooking.userId?.name || 'Customer'}</h4>
                          <p className="text-gray-500 font-bold text-base mt-2">{selectedBooking.userId?.phone || selectedBooking.customerPhone || 'N/A'}</p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${selectedBooking.userId?.phone || selectedBooking.customerPhone}`}
                            className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            📞 Call Now
                          </a>
                          <a
                            href={`https://wa.me/${selectedBooking.userId?.phone || selectedBooking.customerPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl text-center hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Contact Worker Modal */}
                    {activeModal === 'worker' && (
                      <div className="space-y-3 text-center">
                        {selectedBooking.workerId ? (
                          <>
                            <div className="bg-gray-50 p-4 rounded-xl border">
                              <h4 className="font-bold text-gray-900 text-sm">{selectedBooking.workerId.name}</h4>
                              <p className="text-gray-500 font-bold text-base mt-2">{selectedBooking.workerId.phone || 'N/A'}</p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`tel:${selectedBooking.workerId.phone}`}
                                className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                              >
                                📞 Call Worker
                              </a>
                              <a
                                href={`https://wa.me/${selectedBooking.workerId.phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl text-center hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-400 py-4">No worker currently assigned to this booking.</p>
                        )}
                      </div>
                    )}

                    {/* View Logs Modal */}
                    {activeModal === 'logs' && modalData && (
                      <div className="space-y-3">
                        <h4 className="font-black text-gray-800 uppercase tracking-wider text-[10px] border-b pb-1">Dispatch & Event Logs</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {modalData.length > 0 ? (
                            modalData.map((log, index) => (
                              <div key={index} className="p-2 border bg-gray-50 rounded-lg text-[10px]">
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-gray-700">{log.action}</span>
                                  <span className={`text-[8px] font-bold ${log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>{log.status}</span>
                                </div>
                                {log.reason && <p className="text-red-500 mt-0.5">Reason: {log.reason}</p>}
                                <p className="text-[9px] text-gray-400 mt-1">
                                  {new Date(log.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-center py-4">No activity logs recorded.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Admin Note Modal */}
                    {activeModal === 'note' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">Enter Admin Memo</label>
                          <textarea
                            value={adminNoteText}
                            onChange={(e) => setAdminNoteText(e.target.value)}
                            placeholder="Type details to log..."
                            className="w-full border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 text-xs min-h-[80px] resize-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!adminNoteText.trim()) {
                              toast.error('Note cannot be empty');
                              return;
                            }
                            try {
                              toast.loading('Saving internal note...', { id: 'note' });
                              await adminBookingService.addNote(selectedBooking._id, adminNoteText);
                              toast.success('Admin note appended!', { id: 'note' });
                              setAdminNoteText('');
                              setActiveModal(null);
                              fetchData();
                            } catch (err) {
                              toast.error(err.message || 'Failed to save note', { id: 'note' });
                            }
                          }}
                          className="w-full py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all text-xs"
                        >
                          Save Memo
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Bookings;
