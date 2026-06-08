import React, { useState, useEffect } from 'react';
import { 
  FiSmartphone, FiSearch, FiFilter, FiEye, FiTrash2, 
  FiClock, FiCheckCircle, FiPhoneCall, FiXCircle, 
  FiDownload, FiExternalLink, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const AppEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let url = `/admin/app-enquiries?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      setEnquiries(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch app enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    setUpdateLoading(true);
    try {
      await api.put(`/admin/app-enquiries/${id}`, { status, notes });
      toast.success('Status updated successfully');
      fetchEnquiries();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(prev => ({ ...prev, status, notes }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await api.delete(`/admin/app-enquiries/${id}`);
      toast.success('Enquiry deleted');
      fetchEnquiries();
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Reviewed': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contacted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiSmartphone className="text-[#10AFA5]" />
            App Development Enquiries
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage mobile & web app project requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select 
            className="border-none focus:ring-0 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    <div className="animate-spin w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{enq.fullName}</div>
                      <div className="text-xs text-gray-500">{enq.phone}</div>
                      <div className="text-xs text-gray-400">{enq.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#10AFA5]">{enq.appType}</div>
                      <div className="text-xs text-gray-500 truncate w-48">{enq.appCategory}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {enq.budgetRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedEnquiry(enq); setIsModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => deleteEnquiry(enq._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">App Enquiry Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Client Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.fullName}</span></div>
                      {selectedEnquiry.companyName && <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedEnquiry.companyName}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-blue-600">{selectedEnquiry.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">City:</span> <span className="font-medium">{selectedEnquiry.city}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">App Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium text-[#10AFA5]">{selectedEnquiry.appType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Category:</span> <span className="font-medium">{selectedEnquiry.appCategory}</span></div>
                      {selectedEnquiry.appName && <div className="flex justify-between"><span className="text-gray-500">App Name:</span> <span className="font-medium">{selectedEnquiry.appName}</span></div>}
                      
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <span className="text-gray-500 block mb-1">Description:</span>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedEnquiry.description}</p>
                      </div>
                      
                      {selectedEnquiry.problemSolved && (
                        <div>
                          <span className="text-gray-500 block mb-1">Problem Solved:</span>
                          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedEnquiry.problemSolved}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Technical & Features</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Need Backend:</span> <span className="font-medium">{selectedEnquiry.needBackend}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Need Admin Panel:</span> <span className="font-medium">{selectedEnquiry.needAdminPanel}</span></div>
                      
                      {selectedEnquiry.coreFeatures?.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-500 block mb-2">Core Features Required:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedEnquiry.coreFeatures.map(f => (
                              <span key={f} className="px-2 py-1 bg-[#F4FBFB] text-[#10AFA5] rounded border border-[#E5F3F2] text-xs font-medium">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Project Scope</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Budget Range:</span> <span className="font-medium">{selectedEnquiry.budgetRange}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Urgency:</span> <span className="font-medium">{selectedEnquiry.projectUrgency}</span></div>
                      {selectedEnquiry.expectedLaunchDate && (
                        <div className="flex justify-between"><span className="text-gray-500">Expected Launch:</span> <span className="font-medium">{new Date(selectedEnquiry.expectedLaunchDate).toLocaleDateString()}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-500">Design Ready:</span> <span className="font-medium">{selectedEnquiry.hasDesignReady}</span></div>
                    </div>
                  </div>

                  {selectedEnquiry.attachments?.length > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Attachments</h3>
                      <div className="space-y-2">
                        {selectedEnquiry.attachments.map((file, idx) => (
                          <a 
                            key={idx} 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
                          >
                            <FiDownload className="text-[#10AFA5]" />
                            <span className="text-sm text-gray-700 font-medium truncate flex-1">{file.filename || `Attachment ${idx + 1}`}</span>
                            <FiExternalLink className="text-gray-400 group-hover:text-gray-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Update Status</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button disabled={updateLoading} onClick={() => updateStatus(selectedEnquiry._id, 'Reviewed')} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg text-sm transition-colors disabled:opacity-50">Mark as Reviewed</button>
                <button disabled={updateLoading} onClick={() => updateStatus(selectedEnquiry._id, 'Contacted')} className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium rounded-lg text-sm transition-colors disabled:opacity-50">Mark as Contacted</button>
                <button disabled={updateLoading} onClick={() => updateStatus(selectedEnquiry._id, 'Resolved')} className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 font-medium rounded-lg text-sm transition-colors disabled:opacity-50">Mark as Resolved</button>
                <button disabled={updateLoading} onClick={() => updateStatus(selectedEnquiry._id, 'Rejected')} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-sm transition-colors disabled:opacity-50">Mark as Rejected</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppEnquiries;
