import React, { useState, useEffect } from 'react';
import { FiEye, FiSearch, FiFilter, FiCheck, FiX, FiLink, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const WebEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/web-enquiries', {
        params: { status: statusFilter }
      });
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching web enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/web-enquiries/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries(enquiries.map(e => e._id === id ? { ...e, status: newStatus } : e));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Web Development Enquiries</h1>
          <p className="text-gray-500 text-sm">Manage and track client project requests</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#10AFA5]"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button onClick={fetchEnquiries} className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg hover:bg-[#0c8f87] transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                <th className="p-4 font-semibold">Client Name</th>
                <th className="p-4 font-semibold">Project Type</th>
                <th className="p-4 font-semibold">Budget</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading enquiries...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No enquiries found</td></tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{enquiry.fullName}</div>
                      <div className="text-xs text-gray-500">{enquiry.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{enquiry.websiteType}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{enquiry.budgetRange}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">Enquiry Details</h2>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Update Status:</span>
                {['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'].map(s => (
                  <button 
                    key={s}
                    onClick={() => updateStatus(selectedEnquiry._id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedEnquiry.status === s 
                        ? 'bg-[#10AFA5] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2">Client Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500 w-24 inline-block">Name:</span> <span className="font-medium text-gray-800">{selectedEnquiry.fullName}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Company:</span> <span className="text-gray-800">{selectedEnquiry.companyName || 'N/A'}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Email:</span> <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 hover:underline">{selectedEnquiry.email}</a></p>
                    <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-600 hover:underline">{selectedEnquiry.phone}</a></p>
                    <p><span className="text-gray-500 w-24 inline-block">City:</span> <span className="text-gray-800">{selectedEnquiry.city}</span></p>
                  </div>
                </div>

                {/* Project Specs */}
                <div className="space-y-4">
                  <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2">Project Specifications</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500 w-24 inline-block">Type:</span> <span className="font-medium text-gray-800">{selectedEnquiry.websiteType}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Title:</span> <span className="text-gray-800">{selectedEnquiry.projectTitle || 'N/A'}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Pages:</span> <span className="text-gray-800">{selectedEnquiry.pagesNeeded}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Budget:</span> <span className="font-semibold text-gray-800">{selectedEnquiry.budgetRange}</span></p>
                    <p><span className="text-gray-500 w-24 inline-block">Deadline:</span> <span className="text-gray-800">{selectedEnquiry.deadline ? new Date(selectedEnquiry.deadline).toLocaleDateString() : 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2 mb-3">Project Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedEnquiry.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features & Tech */}
                <div>
                  <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2 mb-3">Required Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEnquiry.featuresRequired.length > 0 ? (
                      selectedEnquiry.featuresRequired.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-[#E8F8F7] text-[#10AFA5] text-xs font-medium rounded-md">{f}</span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None specified</span>
                    )}
                  </div>
                  {selectedEnquiry.techPreference && (
                    <p className="text-sm mt-3"><span className="text-gray-500">Tech Preference:</span> {selectedEnquiry.techPreference}</p>
                  )}
                </div>

                {/* Design Preferences */}
                <div className="space-y-2 text-sm">
                  <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2 mb-3">Design Preferences</h3>
                  <p><span className="text-gray-500">Style:</span> <span className="font-medium text-gray-800">{selectedEnquiry.designStylePreference}</span></p>
                  <p><span className="text-gray-500">Has Branding:</span> <span className="text-gray-800">{selectedEnquiry.hasBrandingReady}</span></p>
                  <p><span className="text-gray-500">Existing Site:</span> {selectedEnquiry.hasExistingWebsite === 'Yes' ? (
                    <a href={selectedEnquiry.existingWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 inline-flex">
                      {selectedEnquiry.existingWebsiteUrl} <FiLink className="w-3 h-3" />
                    </a>
                  ) : 'No'}</p>
                  {selectedEnquiry.referenceWebsites && (
                    <div>
                      <span className="text-gray-500 block mb-1">References:</span>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs break-all">{selectedEnquiry.referenceWebsites}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#10AFA5] uppercase text-xs tracking-wider border-b pb-2 mb-3">Attachments</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedEnquiry.attachments.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-[#10AFA5] hover:bg-[#F4FBFB] transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <FiDownload className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#10AFA5] max-w-[150px] truncate">
                          {file.filename || `Attachment ${idx+1}`}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebEnquiries;
