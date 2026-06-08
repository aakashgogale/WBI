import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiFilter, FiEye, FiTrash2, 
  FiClock, FiCheckCircle, FiPhoneCall, FiXCircle, 
  FiDownload, FiExternalLink, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const CrmEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/crm-enquiries', {
        params: { page, limit: 10, status: statusFilter }
      });
      setEnquiries(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching CRM enquiries:', error);
      toast.error('Failed to load CRM enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await api.put(`/admin/crm-enquiries/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    
    try {
      await api.delete(`/admin/crm-enquiries/${id}`);
      toast.success('Enquiry deleted');
      fetchEnquiries();
      if (selectedEnquiry?._id === id) setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry');
    }
  };

  const openModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Reviewed': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-purple-100 text-purple-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    const icons = {
      'Pending': <FiClock className="mr-1" />,
      'Reviewed': <FiEye className="mr-1" />,
      'Contacted': <FiPhoneCall className="mr-1" />,
      'Resolved': <FiCheckCircle className="mr-1" />,
      'Rejected': <FiXCircle className="mr-1" />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${styles[status] || styles['Pending']}`}>
        {icons[status]} {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CRM Development Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Manage leads for CRM development services</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <FiFilter className="mr-2" />
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-sm w-40"
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Client Info</th>
                <th className="p-4 font-medium">Industry</th>
                <th className="p-4 font-medium">Budget</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#10AFA5] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{enq.fullName}</div>
                      <div className="text-xs text-gray-500">{enq.phone}</div>
                      {enq.companyName && <div className="text-xs text-[#10AFA5]">{enq.companyName}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {enq.businessType}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {enq.budgetRange}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(enq)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => deleteEnquiry(enq._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Enquiry"
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(prev => prev - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(prev => prev + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">CRM Enquiry Details</h2>
                <p className="text-xs text-gray-500 mt-1">Submitted on: {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedEnquiry.status)}
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors">
                  <FiX />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Client & Basic Info */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Client Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.fullName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium text-[#10AFA5]">{selectedEnquiry.companyName || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-blue-600">{selectedEnquiry.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">City:</span> <span className="font-medium">{selectedEnquiry.city}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Project Specifics</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Industry:</span> <span className="font-medium bg-gray-100 px-2 rounded">{selectedEnquiry.businessType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Current CRM:</span> <span className="font-medium text-purple-600">{selectedEnquiry.currentCrm}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Team Size:</span> <span className="font-medium">{selectedEnquiry.teamSize}</span></div>
                      <div className="mt-3">
                        <span className="text-gray-500 block mb-1">Reason for CRM / Pain Points:</span>
                        <div className="p-3 bg-gray-50 border rounded text-gray-700 italic">
                          "{selectedEnquiry.reasonForCrm}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Features & Tech */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Features & Tech</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block mb-2">Core Modules Needed:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedEnquiry.coreModules && selectedEnquiry.coreModules.length > 0 ? (
                            selectedEnquiry.coreModules.map(m => (
                              <span key={m} className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-1 rounded text-xs">{m}</span>
                            ))
                          ) : (
                            <span className="text-gray-400">None selected</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-50 mt-2">
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Deployment:</span> <span className="font-medium">{selectedEnquiry.deploymentType}</span></div>
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Custom Modules Needed:</span> <span className="font-medium">{selectedEnquiry.customModulesNeeded}</span></div>
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Mobile App:</span> <span className="font-medium">{selectedEnquiry.needMobileApp}</span></div>
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Data Migration:</span> <span className="font-medium">{selectedEnquiry.needDataMigration}</span></div>
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Staff Training:</span> <span className="font-medium">{selectedEnquiry.needStaffTraining}</span></div>
                      </div>
                      
                      {selectedEnquiry.thirdPartyIntegration && (
                        <div className="pt-2">
                          <span className="text-gray-500 block mb-1">Integrations:</span>
                          <span className="font-medium text-indigo-600">{selectedEnquiry.thirdPartyIntegration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Timeline & Attachments</h3>
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">Urgency:</span> <span className="font-bold text-red-600">{selectedEnquiry.projectUrgency}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Expected Go-Live:</span> <span className="font-medium">{selectedEnquiry.expectedLaunchDate ? new Date(selectedEnquiry.expectedLaunchDate).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget:</span> <span className="font-bold text-green-600">{selectedEnquiry.budgetRange}</span></div>
                    </div>

                    {/* Attachments Section */}
                    {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiFileText /> Attachments</h4>
                        <div className="space-y-2">
                          {selectedEnquiry.attachments.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-teal-50 border border-gray-200 rounded-lg group transition-colors"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <FiFileText className="text-[#10AFA5] flex-shrink-0" />
                                <span className="text-sm text-gray-700 font-medium truncate">{file.filename || `Attachment ${idx+1}`}</span>
                              </div>
                              <FiDownload className="text-gray-400 group-hover:text-[#10AFA5] flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Update Status:</h3>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedEnquiry._id, status)}
                    disabled={isUpdatingStatus || selectedEnquiry.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedEnquiry.status === status 
                        ? 'bg-[#10AFA5] text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CrmEnquiries;
