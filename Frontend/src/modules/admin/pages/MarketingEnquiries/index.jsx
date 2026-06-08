import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiFilter, FiEye, FiTrash2, 
  FiClock, FiCheckCircle, FiPhoneCall, FiXCircle, 
  FiDownload, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const MarketingEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/marketing-enquiries', { params: { page, limit: 10, status: statusFilter } });
      setEnquiries(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load marketing enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, [page, statusFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await api.put(`/admin/marketing-enquiries/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      if (selectedEnquiry && selectedEnquiry._id === id) setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      fetchEnquiries();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await api.delete(`/admin/marketing-enquiries/${id}`);
      toast.success('Enquiry deleted');
      fetchEnquiries();
      if (selectedEnquiry?._id === id) setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const openModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800', 'Reviewed': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-purple-100 text-purple-800', 'Resolved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    const icons = {
      'Pending': <FiClock className="mr-1" />, 'Reviewed': <FiEye className="mr-1" />,
      'Contacted': <FiPhoneCall className="mr-1" />, 'Resolved': <FiCheckCircle className="mr-1" />,
      'Rejected': <FiXCircle className="mr-1" />,
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${styles[status] || styles['Pending']}`}>{icons[status]} {status}</span>;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Digital Marketing Enquiries</h1>
        <p className="text-gray-500 text-sm mt-1">Manage leads for Digital Marketing services</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <FiFilter className="mr-2" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-transparent border-none outline-none text-sm w-40">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Client Info</th>
                <th className="p-4 font-medium">Goal</th>
                <th className="p-4 font-medium">Budget</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading enquiries...</td></tr> : enquiries.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-500">No enquiries found.</td></tr> : enquiries.map((enq) => (
                <tr key={enq._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-600">{new Date(enq.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{enq.fullName}</div>
                    <div className="text-xs text-gray-500">{enq.phone}</div>
                    {enq.companyName && <div className="text-xs text-[#10AFA5]">{enq.companyName}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{enq.primaryGoal}</td>
                  <td className="p-4 text-sm font-medium text-gray-700">{enq.budgetRange}</td>
                  <td className="p-4">{getStatusBadge(enq.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(enq)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><FiEye /></button>
                      <button onClick={() => deleteEnquiry(enq._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between bg-gray-50">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg bg-white text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg bg-white text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">Marketing Enquiry Details</h2>
                <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-4">
                {getStatusBadge(selectedEnquiry.status)}
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full"><FiX /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Client Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.fullName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium text-[#10AFA5]">{selectedEnquiry.companyName || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-blue-600">{selectedEnquiry.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">City:</span> <span className="font-medium">{selectedEnquiry.city}</span></div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Business Profile</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Business Type:</span> <span className="font-medium">{selectedEnquiry.businessType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Industry:</span> <span className="font-medium">{selectedEnquiry.industry}</span></div>
                      <div className="pt-2">
                        <span className="text-gray-500 block mb-1">Current Online Presence:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEnquiry.currentOnlinePresence?.map(s => <span key={s} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{s}</span>)}
                        </div>
                      </div>
                      <div className="flex justify-between mt-2"><span className="text-gray-500">Current Budget:</span> <span className="font-medium">{selectedEnquiry.currentMonthlyMarketingBudget}</span></div>
                      <div className="flex justify-between mt-2"><span className="text-gray-500">Primary Goal:</span> <span className="font-medium text-purple-600">{selectedEnquiry.primaryGoal}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Content & Branding</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Existing Creatives:</span> <span className="font-medium">{selectedEnquiry.hasExistingCreatives}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Brand Guidelines:</span> <span className="font-medium">{selectedEnquiry.hasBrandGuidelines}</span></div>
                      <div className="pt-2">
                        <span className="text-gray-500 block mb-1">Language Preference:</span>
                        <span className="font-medium">{selectedEnquiry.contentLanguage?.join(', ')}</span>
                      </div>
                      <div className="flex justify-between mt-2"><span className="text-gray-500">Posting Frequency:</span> <span className="font-medium">{selectedEnquiry.postingFrequency}</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Services & Targeting</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block mb-2">Services Needed:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedEnquiry.servicesNeeded?.length ? selectedEnquiry.servicesNeeded.map(s => <span key={s} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs border border-orange-100">{s}</span>) : <span className="text-gray-400">None selected</span>}
                        </div>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between mt-2"><span className="text-gray-500">Target Location:</span> <span className="font-medium">{selectedEnquiry.targetLocation}</span></div>
                        {selectedEnquiry.targetLocation === 'Specific Cities' && (
                          <div className="flex justify-between mt-2"><span className="text-gray-500">Specific Cities:</span> <span className="font-medium">{selectedEnquiry.specificCities}</span></div>
                        )}
                        <div className="mt-2">
                          <span className="text-gray-500 block mb-1">Target Audience:</span>
                          <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{selectedEnquiry.targetAudience}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Timeline & Budget</h3>
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">Urgency:</span> <span className="font-medium">{selectedEnquiry.urgency}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Contract Duration:</span> <span className="font-medium">{selectedEnquiry.contractDuration}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget:</span> <span className="font-bold text-green-600">{selectedEnquiry.budgetRange}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Source:</span> <span className="font-medium">{selectedEnquiry.source}</span></div>
                    </div>
                    {selectedEnquiry.attachments?.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><FiFileText /> Attachments</h4>
                        <div className="space-y-2">
                          {selectedEnquiry.attachments.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex justify-between p-3 bg-gray-50 hover:bg-teal-50 border rounded-lg group">
                              <span className="text-sm text-gray-700 font-medium truncate">{file.filename || `Attachment ${idx+1}`}</span>
                              <FiDownload className="text-gray-400 group-hover:text-[#10AFA5]" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-white">
              <h3 className="text-sm font-bold mb-3">Update Status:</h3>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'].map(status => (
                  <button key={status} onClick={() => updateStatus(selectedEnquiry._id, status)} disabled={isUpdatingStatus || selectedEnquiry.status === status} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedEnquiry.status === status ? 'bg-[#10AFA5] text-white' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-50`}>
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

export default MarketingEnquiries;
