import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiFilter, FiEye, FiTrash2, 
  FiClock, FiCheckCircle, FiPhoneCall, FiXCircle, 
  FiDownload, FiExternalLink, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const DesignEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/design-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch Design enquiries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await api.put(`/admin/design-enquiries/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries(enquiries.map(enq => enq._id === id ? { ...enq, status: newStatus } : enq));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/design-enquiries/${id}`);
      if (res.data.success) {
        toast.success('Enquiry deleted successfully');
        setEnquiries(enquiries.filter(enq => enq._id !== id));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setIsModalOpen(false);
          setSelectedEnquiry(null);
        }
      }
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
      'New': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Contacted': 'bg-purple-100 text-purple-700 border-purple-200',
      'Proposal Sent': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['New']}`}>{status}</span>;
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || enq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">UI/UX Design Enquiries</h1>
          <p className="text-gray-500 mt-1">Manage client requests for website & app design</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none bg-white"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Contacted">Contacted</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Client Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Design Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Budget</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading enquiries...</td></tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No design enquiries found.</td></tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{enquiry.fullName}</div>
                      <div className="text-sm text-gray-500">{enquiry.companyName || 'Individual'}</div>
                      <div className="text-xs text-gray-400 mt-1">{enquiry.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{enquiry.designType}</div>
                      <div className="text-xs text-gray-500 mt-1">{enquiry.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-green-600">{enquiry.budgetRange}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(enquiry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <FiEye className="text-lg" />
                        </button>
                        <button onClick={() => handleDelete(enquiry._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <FiTrash2 className="text-lg" />
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

      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiFileText className="text-[#10AFA5]" /> Design Enquiry Details
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Client Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.fullName}</span></div>
                      {selectedEnquiry.companyName && (
                        <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedEnquiry.companyName}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedEnquiry.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">City:</span> <span className="font-medium">{selectedEnquiry.city}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Project Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedEnquiry.designType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Title:</span> <span className="font-medium">{selectedEnquiry.projectTitle}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pages:</span> <span className="font-medium">{selectedEnquiry.pagesCount}</span></div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Description:</span>
                        <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{selectedEnquiry.projectDescription}</p>
                      </div>
                      <div className="pt-2">
                        <span className="text-gray-500 block mb-1">Target Audience:</span>
                        <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{selectedEnquiry.targetAudience}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Branding & Style</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Has Logo:</span> <span className="font-medium">{selectedEnquiry.hasLogo}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Brand Colors:</span> <span className="font-medium">{selectedEnquiry.hasBrandColors}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Style:</span> <span className="font-medium">{selectedEnquiry.designStyle}</span></div>
                      {selectedEnquiry.colorTheme && <div className="flex justify-between"><span className="text-gray-500">Colors:</span> <span className="font-medium">{selectedEnquiry.colorTheme}</span></div>}
                      {selectedEnquiry.referenceWebsites && (
                        <div className="pt-2 mt-2 border-t">
                          <span className="text-gray-500 block mb-1">References:</span>
                          <p className="font-medium">{selectedEnquiry.referenceWebsites}</p>
                        </div>
                      )}
                      {selectedEnquiry.excludeDesignElements && (
                        <div className="pt-2 mt-2 border-t">
                          <span className="text-gray-500 block mb-1">Do Not Want:</span>
                          <p className="font-medium text-red-500">{selectedEnquiry.excludeDesignElements}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Content & Assets</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Provide Content:</span> <span className="font-medium">{selectedEnquiry.provideContent}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Provide Images:</span> <span className="font-medium">{selectedEnquiry.provideImages}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Existing Files:</span> <span className="font-medium">{selectedEnquiry.hasDesignFiles}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Need Icons:</span> <span className="font-medium">{selectedEnquiry.needIcons}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Deliverables</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block mb-2">Required Format:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedEnquiry.requiredFormat?.map(s => <span key={s} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs border border-orange-100">{s}</span>)}
                        </div>
                      </div>
                      <div className="flex justify-between border-t pt-2"><span className="text-gray-500">Responsive:</span> <span className="font-medium">{selectedEnquiry.responsiveDesign}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Interactive:</span> <span className="font-medium">{selectedEnquiry.interactivePrototype}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Dev Handoff:</span> <span className="font-medium">{selectedEnquiry.developerHandoff}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b">Timeline & Budget</h3>
                    <div className="space-y-3 text-sm mb-4">
                      {selectedEnquiry.expectedDeliveryDate && <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selectedEnquiry.expectedDeliveryDate).toLocaleDateString()}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-500">Urgency:</span> <span className="font-medium">{selectedEnquiry.urgency}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget:</span> <span className="font-bold text-green-600">{selectedEnquiry.budgetRange}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Source:</span> <span className="font-medium">{selectedEnquiry.source}</span></div>
                    </div>
                    {selectedEnquiry.attachments?.length > 0 && (
                      <div className="border-t pt-4">
                        <span className="text-gray-500 block mb-3 text-sm">Attachments:</span>
                        <div className="space-y-2">
                          {selectedEnquiry.attachments.map((file, i) => (
                            <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="text-sm truncate mr-2">{file.filename || `Attachment ${i + 1}`}</span>
                              <FiDownload className="text-[#10AFA5] flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="px-8 py-5 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Update Status:</span>
                <div className="flex gap-2">
                  {['New', 'In Progress', 'Contacted', 'Proposal Sent', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, status)}
                      disabled={updatingId === selectedEnquiry._id}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedEnquiry.status === status 
                          ? 'bg-[#10AFA5] text-white shadow-md' 
                          : 'bg-white border text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <a 
                href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hi ${selectedEnquiry.fullName}, we received your Design Enquiry for ${selectedEnquiry.projectTitle}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <FiPhoneCall /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignEnquiries;
