import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiEye, FiTrash2, FiX, 
  FiPhoneCall, FiDownload, FiMapPin, FiBox, 
  FiLayers, FiClock, FiCpu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const MultipleServicesEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validStatuses = ['New', 'Site Visit Scheduled', 'Proposal Sent', 'Under Negotiation', 'Implementation', 'Completed', 'Closed'];

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/multipleservices-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch enquiries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const res = await api.delete(`/admin/multipleservices-enquiries/${id}`);
      if (res.data.success) {
        toast.success('Enquiry deleted successfully');
        setEnquiries(enquiries.filter(e => e._id !== id));
        if (selectedEnquiry?._id === id) setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/multipleservices-enquiries/${id}/status`, { status: newStatus });
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

  const openModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-red-100 text-red-800 border-red-200';
      case 'Site Visit Scheduled': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Proposal Sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Implementation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiLayers className="text-indigo-600" />
            Multiple Services Leads
          </h1>
          <p className="text-gray-500 mt-1">Manage bundled requests covering installation, AMC, site testing, and more</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, company, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setStatusFilter('All')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Leads
          </button>
          {validStatuses.map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border ${statusFilter === status ? getStatusColor(status) : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiFileText className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>No multiple services enquiries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Client Info</th>
                  <th className="p-4 font-medium">Services Requested</th>
                  <th className="p-4 font-medium">Priority Service</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(enq.createdAt).toLocaleDateString()}<br/>
                      <span className="text-xs text-gray-400">{new Date(enq.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{enq.companyName || enq.fullName}</div>
                      <div className="text-sm text-gray-500">{enq.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800 flex items-center gap-1"><FiLayers className="text-indigo-400"/> {enq.servicesNeeded?.length} Services</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{enq.budgetRange}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{enq.priorityService}</div>
                      <div className="text-xs text-red-600 truncate max-w-[150px]">{enq.projectUrgency}</div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={enq.status} 
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border outline-none cursor-pointer ${getStatusColor(enq.status)}`}
                      >
                        {validStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openModal(enq)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <FiEye />
                      </button>
                      <button onClick={() => handleDelete(enq._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl">
                  <FiLayers />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Multi-Service #{selectedEnquiry._id.slice(-6).toUpperCase()}</h2>
                  <p className="text-sm text-gray-500">{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiX className="text-xl" /></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* Status Update Banner */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-700">Current Status</h4>
                  <p className="text-xs text-gray-500">Update the progress of this request</p>
                </div>
                <select 
                  value={selectedEnquiry.status} 
                  onChange={(e) => handleStatusChange(selectedEnquiry._id, e.target.value)}
                  className={`text-sm font-bold px-4 py-2 rounded-lg border outline-none cursor-pointer ${getStatusColor(selectedEnquiry.status)}`}
                >
                  {validStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Client Info */}
                <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2"><FiMapPin className="text-indigo-500"/> Client Information</h3>
                  <div className="space-y-3">
                    <div><span className="text-xs text-gray-500 block">Full Name</span><div className="font-medium">{selectedEnquiry.fullName}</div></div>
                    {selectedEnquiry.companyName && <div><span className="text-xs text-gray-500 block">Company</span><div className="font-medium">{selectedEnquiry.companyName}</div></div>}
                    <div>
                      <span className="text-xs text-gray-500 block">Contact</span>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${selectedEnquiry.phone}`} className="text-blue-600 hover:underline flex items-center gap-1"><FiPhoneCall /> {selectedEnquiry.phone}</a>
                        <span className="text-gray-300">|</span>
                        <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 hover:underline">{selectedEnquiry.email}</a>
                      </div>
                    </div>
                    <div><span className="text-xs text-gray-500 block">Designation</span><div>{selectedEnquiry.designation}</div></div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-xs text-gray-500 block">Address</span>
                      <div className="font-medium text-sm">{selectedEnquiry.siteAddress}</div>
                      <div className="text-sm text-gray-600">{selectedEnquiry.city}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Services Requested */}
                <div className="border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2"><FiLayers className="text-blue-500"/> Services Required</h3>
                  
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                    <span className="text-xs text-red-600 block">Priority / Most Urgent</span>
                    <div className="font-bold text-red-800">{selectedEnquiry.priorityService}</div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs text-gray-500 block mb-2">All Requested Services</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnquiry.servicesNeeded?.map(s => (
                        <span key={s} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  {selectedEnquiry.servicesDescription && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-xs font-bold text-gray-700 block mb-1">Service Notes</span>
                      <p className="text-sm text-gray-600">{selectedEnquiry.servicesDescription}</p>
                    </div>
                  )}
                </div>

                {/* 3. Site & Equipment Details */}
                <div className="border border-gray-100 rounded-xl p-5 shadow-sm md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2"><FiBox className="text-purple-500"/> Site Details</h3>
                      <div className="space-y-3">
                        <div><span className="text-xs text-gray-500 block">Site Type</span><div className="font-medium text-sm">{selectedEnquiry.siteType}</div></div>
                        <div className="flex gap-4">
                          <div className="flex-1"><span className="text-xs text-gray-500 block">Locations</span><div className="font-medium text-sm">{selectedEnquiry.numberOfSites}</div></div>
                          <div className="flex-1"><span className="text-xs text-gray-500 block">Floors</span><div className="font-medium text-sm">{selectedEnquiry.numberOfFloors}</div></div>
                        </div>
                        <div><span className="text-xs text-gray-500 block">Site Size</span><div className="font-medium text-sm">{selectedEnquiry.siteSize}</div></div>
                        <div><span className="text-xs text-gray-500 block">Operational?</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedEnquiry.siteOperational === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selectedEnquiry.siteOperational}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2"><FiCpu className="text-orange-500"/> Equipment Overview</h3>
                      <div className="space-y-3">
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <span className="text-xs text-orange-600 block">Approx. Total Devices</span>
                          <div className="font-bold text-orange-800">{selectedEnquiry.approximateTotalDevices}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-2">Equipment Types Involved</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedEnquiry.equipmentInvolved?.map(s => (
                              <span key={s} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-md">{s}</span>
                            ))}
                          </div>
                        </div>
                        {selectedEnquiry.equipmentBrand && (
                          <div><span className="text-xs text-gray-500 block">Brands / Makes</span><div className="font-medium text-sm">{selectedEnquiry.equipmentBrand}</div></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Scheduling & Financials */}
                <div className="border border-gray-100 rounded-xl p-5 shadow-sm md:col-span-2">
                  <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2"><FiClock className="text-green-500"/> Visit & Financials</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1 bg-green-50 p-3 rounded-lg border border-green-100">
                      <span className="text-xs text-green-700 block">Overall Budget</span>
                      <div className="font-bold text-green-800 text-sm">{selectedEnquiry.budgetRange}</div>
                    </div>
                    <div><span className="text-xs text-gray-500 block">Urgency</span><div className="font-bold text-red-600">{selectedEnquiry.projectUrgency}</div></div>
                    <div><span className="text-xs text-gray-500 block">Visit Slot</span><div className="font-medium text-sm">{selectedEnquiry.preferredTimeSlot}</div></div>
                    {selectedEnquiry.preferredSiteVisitDate && (
                      <div><span className="text-xs text-gray-500 block">Visit Date</span><div className="font-medium text-sm">{new Date(selectedEnquiry.preferredSiteVisitDate).toLocaleDateString()}</div></div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div><span className="text-xs text-gray-500 block">Single Point of Contact Needed?</span><div className="text-sm font-medium">{selectedEnquiry.needSinglePointOfContact}</div></div>
                    <div><span className="text-xs text-gray-500 block">Combined AMC Needed?</span><div className="text-sm font-medium">{selectedEnquiry.needCombinedAmc}</div></div>
                  </div>
                </div>

              </div>

              {/* Attachments */}
              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div className="mt-6 border border-gray-100 rounded-xl p-5 shadow-sm bg-gray-50">
                  <h3 className="text-md font-bold text-gray-800 mb-4">Attachments & Reference Docs ({selectedEnquiry.attachments.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEnquiry.attachments.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                          <FiDownload />
                        </div>
                        <div className="truncate text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                          {file.filename || `Attachment ${i + 1}`}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEnquiry.additionalNotes && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-yellow-800 mb-2">Special Requirements</h3>
                  <p className="text-sm text-yellow-900 whitespace-pre-wrap">{selectedEnquiry.additionalNotes}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleServicesEnquiries;
