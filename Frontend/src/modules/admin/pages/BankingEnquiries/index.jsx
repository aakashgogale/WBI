import React, { useState, useEffect } from 'react';
import { FiEye, FiSearch, FiFilter, FiCheck, FiX, FiLink, FiDownload, FiServer } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const BankingEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banking-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching banking enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/banking-enquiries/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries(enquiries.map(enq => 
          enq._id === id ? { ...enq, status: newStatus } : enq
        ));
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-blue-600 bg-blue-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-[#F8FCFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiServer className="text-[#10AFA5]" /> Banking Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage infrastructure, ATM, and service requests</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by client, company, or service..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#10AFA5]/20"
          />
        </div>
        <div className="relative min-w-[200px]">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#10AFA5]/20 appearance-none font-medium text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Client / Date</th>
                <th className="p-4">Service Required</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#10AFA5] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-gray-800">{enq.fullName}</div>
                      <div className="text-xs text-gray-500">{new Date(enq.createdAt).toLocaleDateString()}</div>
                      {enq.companyName && <div className="text-[10px] text-gray-400 mt-0.5">{enq.companyName}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{enq.serviceType}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{enq.machineModels || 'Standard request'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getUrgencyColor(enq.urgency)}`}>
                        {enq.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={enq.status}
                        onChange={(e) => updateStatus(enq._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${getStatusColor(enq.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => { setSelectedEnquiry(enq); setIsModalOpen(true); }}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors mx-auto"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">{selectedEnquiry.serviceType}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Details</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div>
                        <div className="text-[11px] text-gray-500">Full Name</div>
                        <div className="font-semibold text-gray-800 text-sm">{selectedEnquiry.fullName}</div>
                      </div>
                      {(selectedEnquiry.companyName || selectedEnquiry.branchCode) && (
                        <div className="grid grid-cols-2 gap-3">
                          {selectedEnquiry.companyName && (
                            <div>
                              <div className="text-[11px] text-gray-500">Bank/Company</div>
                              <div className="font-semibold text-gray-800 text-sm">{selectedEnquiry.companyName}</div>
                            </div>
                          )}
                          {selectedEnquiry.branchCode && (
                            <div>
                              <div className="text-[11px] text-gray-500">Branch Code</div>
                              <div className="font-semibold text-gray-800 text-sm">{selectedEnquiry.branchCode}</div>
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] text-gray-500">Email Address</div>
                        <div className="font-medium text-blue-600 text-sm">
                          <a href={`mailto:${selectedEnquiry.email}`}>{selectedEnquiry.email}</a>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[11px] text-gray-500">Phone Number</div>
                          <div className="font-medium text-gray-800 text-sm">
                            <a href={`tel:${selectedEnquiry.phone}`}>{selectedEnquiry.phone}</a>
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-gray-500">City/Location</div>
                          <div className="font-medium text-gray-800 text-sm">{selectedEnquiry.city}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hardware / Scope</h3>
                    <div className="bg-[#F4FBFB] border border-[#E5F3F2] rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[11px] text-[#10AFA5]">Units / Locations</div>
                          <div className="font-semibold text-gray-800 text-sm">{selectedEnquiry.numberOfUnits || '1-5'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#10AFA5]">Urgency</div>
                          <div className={`font-semibold text-sm ${getUrgencyColor(selectedEnquiry.urgency).split(' ')[0]}`}>{selectedEnquiry.urgency}</div>
                        </div>
                      </div>
                      {selectedEnquiry.machineModels && (
                        <div>
                          <div className="text-[11px] text-[#10AFA5]">Machine Models</div>
                          <div className="font-semibold text-gray-800 text-sm">{selectedEnquiry.machineModels}</div>
                        </div>
                      )}
                      {selectedEnquiry.deadline && (
                        <div>
                          <div className="text-[11px] text-[#10AFA5]">Deadline / Target Date</div>
                          <div className="font-semibold text-gray-800 text-sm">{new Date(selectedEnquiry.deadline).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Requirement Description</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedEnquiry.description}
                      </p>
                    </div>
                  </div>

                  {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments ({selectedEnquiry.attachments.length})</h3>
                      <div className="space-y-2">
                        {selectedEnquiry.attachments.map((file, idx) => (
                          <a 
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-[#10AFA5] hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-[#E8F8F7] text-[#10AFA5] flex items-center justify-center shrink-0">
                                <FiLink className="w-4 h-4" />
                              </div>
                              <span className="text-sm text-gray-700 font-medium truncate">{file.filename || `Attachment ${idx + 1}`}</span>
                            </div>
                            <FiDownload className="text-gray-400 group-hover:text-[#10AFA5] shrink-0 mx-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                    <div className="flex gap-2">
                      <a 
                        href={`mailto:${selectedEnquiry.email}?subject=Regarding your ${selectedEnquiry.serviceType} Enquiry`}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-center text-sm font-bold hover:bg-blue-100 transition-colors"
                      >
                        Send Email
                      </a>
                      <button 
                        onClick={() => {
                          updateStatus(selectedEnquiry._id, 'Reviewed');
                          setIsModalOpen(false);
                        }}
                        className="flex-1 py-2 bg-[#10AFA5] text-white rounded-xl text-center text-sm font-bold hover:bg-[#0C8F87] transition-colors shadow-sm"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BankingEnquiries;
