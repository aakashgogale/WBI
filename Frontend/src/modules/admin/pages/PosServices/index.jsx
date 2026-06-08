import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiTrash2, FiMapPin, FiCalendar, FiClock, FiActivity, FiX, FiCheckCircle, FiSmartphone, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import dayjs from 'dayjs';

const PosServices = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/admin/posservice-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch POS service enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/posservice-enquiries/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Status updated successfully');
        fetchEnquiries();
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        const res = await api.delete(`/admin/posservice-enquiries/${id}`);
        if (res.data.success) {
          toast.success('Enquiry deleted successfully');
          fetchEnquiries();
          setIsModalOpen(false);
        }
      } catch (error) {
        toast.error('Failed to delete enquiry');
      }
    }
  };

  const filteredEnquiries = enquiries.filter(enq => 
    enq.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.terminalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Technician Assigned': 'bg-purple-100 text-purple-800 border-purple-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['New']}`}>{status}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency?.includes('Emergency') || urgency?.includes('Same day') || urgency?.includes('ASAP')) {
      return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100 flex items-center gap-1"><FiAlertTriangle /> {urgency}</span>;
    }
    return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200">{urgency}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">POS Service Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Manage card swipe machine faults, repairs, and network issues</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium border border-blue-100">
          Total Leads: {enquiries.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by business, terminal ID, name or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10AFA5] bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Business / Site</th>
                <th className="p-4 font-medium">Terminal ID</th>
                <th className="p-4 font-medium">Service Required</th>
                <th className="p-4 font-medium">Urgency</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#10AFA5] border-t-transparent rounded-full animate-spin"></div>
                      Loading enquiries...
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No enquiries found</td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{enq.organizationName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><FiMapPin className="text-gray-400" /> {enq.city}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-800">{enq.terminalId}</div>
                      <div className="text-xs text-gray-500">{enq.posBrand} • {enq.posType}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800 truncate max-w-[200px]">{enq.serviceRequired}</div>
                      {enq.posStatus === 'Not working' && <div className="text-xs text-red-500 font-medium flex items-center mt-1"><FiAlertTriangle className="mr-1"/> Out of service</div>}
                    </td>
                    <td className="p-4">{getUrgencyBadge(enq.urgency)}</td>
                    <td className="p-4 text-sm text-gray-600">{dayjs(enq.createdAt).format('DD MMM YYYY')}</td>
                    <td className="p-4">{getStatusBadge(enq.status)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => { setSelectedEnquiry(enq); setIsModalOpen(true); }}
                        className="p-2 text-gray-600 hover:text-[#10AFA5] hover:bg-teal-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="text-lg" />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#E8F5F1] text-[#10AFA5] rounded-lg"><FiSmartphone className="text-xl" /></div>
                  <h2 className="text-2xl font-bold text-gray-800">POS Request</h2>
                  {getStatusBadge(selectedEnquiry.status)}
                </div>
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <FiCalendar /> Submitted on {dayjs(selectedEnquiry.createdAt).format('DD MMM YYYY, hh:mm A')}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FiX className="text-xl text-gray-500" /></button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col - Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Client Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2"><FiCheckCircle className="text-[#10AFA5]"/> Client & Site Info</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div><p className="text-xs text-gray-500">Business / Organization</p><p className="font-medium text-gray-800">{selectedEnquiry.organizationName}</p></div>
                      <div><p className="text-xs text-gray-500">Contact Person</p><p className="font-medium text-gray-800">{selectedEnquiry.fullName} <span className="text-gray-400 text-xs">({selectedEnquiry.designation})</span></p></div>
                      <div><p className="text-xs text-gray-500">Contact Details</p><p className="font-medium text-gray-800">{selectedEnquiry.phone} / {selectedEnquiry.email}</p></div>
                      <div className="col-span-2"><p className="text-xs text-gray-500">Site Address</p><p className="font-medium text-gray-800">{selectedEnquiry.siteAddress}, {selectedEnquiry.city}</p></div>
                    </div>
                  </div>

                  {/* POS Details */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2"><FiSmartphone className="text-indigo-500"/> POS Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      <div className="col-span-2 md:col-span-1"><p className="text-xs text-gray-500">Type & Brand</p><p className="font-medium text-gray-800">{selectedEnquiry.posType} ({selectedEnquiry.posBrand})</p></div>
                      <div><p className="text-xs text-gray-500">Terminal ID (TID)</p><p className="font-bold text-gray-800">{selectedEnquiry.terminalId}</p></div>
                      <div><p className="text-xs text-gray-500">Machine Count</p><p className="font-medium text-gray-800">{selectedEnquiry.numberOfMachines}</p></div>
                      <div><p className="text-xs text-gray-500">Linked Bank / Gateway</p><p className="font-medium text-gray-800">{selectedEnquiry.linkedBank}</p></div>
                      {selectedEnquiry.posModelNumber && <div><p className="text-xs text-gray-500">Model Number</p><p className="font-medium text-gray-800">{selectedEnquiry.posModelNumber}</p></div>}
                    </div>
                  </div>

                  {/* Fault / Issue Requirements */}
                  <div className={`${selectedEnquiry.posStatus === 'Not working' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} rounded-xl p-5 border`}>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FiActivity className={selectedEnquiry.posStatus === 'Not working' ? 'text-red-500' : 'text-orange-500'}/> Fault & Service Required
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-4">
                      <div><p className="text-xs text-gray-500">Service Required</p><p className="font-bold text-gray-800">{selectedEnquiry.serviceRequired}</p></div>
                      <div><p className="text-xs text-gray-500">POS Status</p><p className="font-medium text-gray-800">{selectedEnquiry.posStatus}</p></div>
                      <div><p className="text-xs text-gray-500">Issue Started</p><p className="font-medium text-gray-800">{selectedEnquiry.issueStartTime}</p></div>
                      <div><p className="text-xs text-gray-500">Error Shown</p><p className="font-medium text-gray-800">{selectedEnquiry.errorShown || 'None'}</p></div>
                    </div>
                    {selectedEnquiry.issueDescription && (
                      <div><p className="text-xs text-gray-500">Issue Description</p><p className="text-sm text-gray-800 bg-white p-3 rounded-lg border mt-1 whitespace-pre-wrap">{selectedEnquiry.issueDescription}</p></div>
                    )}
                  </div>

                  {/* Visit & Logistics */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2"><FiClock className="text-blue-500"/> Visit & Logistics</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div><p className="text-xs text-gray-500">Urgency</p><div className="mt-1">{getUrgencyBadge(selectedEnquiry.urgency)}</div></div>
                      <div><p className="text-xs text-gray-500">Preferred Visit</p><p className="font-medium text-gray-800">{selectedEnquiry.preferredVisitDate ? dayjs(selectedEnquiry.preferredVisitDate).format('DD MMM YYYY') : 'Any Date'} ({selectedEnquiry.preferredTimeSlot})</p></div>
                      <div><p className="text-xs text-gray-500">Site Contact</p><p className="font-medium text-gray-800">{selectedEnquiry.siteContactName}</p></div>
                      <div><p className="text-xs text-gray-500">Site Phone</p><p className="font-medium text-gray-800">{selectedEnquiry.siteContactNumber}</p></div>
                    </div>
                  </div>

                </div>

                {/* Right Col - Sidebar */}
                <div className="space-y-6">
                  {/* Status Update */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Update Status</h3>
                    <select 
                      value={selectedEnquiry.status}
                      onChange={(e) => updateStatus(selectedEnquiry._id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10AFA5] text-sm"
                    >
                      <option value="New">New</option>
                      <option value="Technician Assigned">Technician Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Quick Info */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Info</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2"><FiCheckCircle className={selectedEnquiry.needServiceReport === 'Yes' ? 'text-[#10AFA5]' : 'text-gray-300'}/> Service Report Req</li>
                      <li className="flex items-center gap-2"><FiCheckCircle className={selectedEnquiry.interestedInAmc === 'Yes' ? 'text-[#10AFA5]' : 'text-gray-300'}/> Interested in AMC</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Budget Range</p>
                      <p className="font-medium text-gray-800">{selectedEnquiry.budgetRange}</p>
                    </div>
                    {selectedEnquiry.additionalNotes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Additional Notes</p>
                        <p className="text-sm text-gray-800 mt-1">{selectedEnquiry.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Attachments ({selectedEnquiry.attachments?.length || 0})</h3>
                    {selectedEnquiry.attachments?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedEnquiry.attachments.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border border-gray-100 text-sm text-[#10AFA5] transition-colors">
                            <FiActivity /> <span className="truncate">{file.filename || `Attachment ${i+1}`}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No files attached</p>
                    )}
                  </div>

                  {/* Delete Action */}
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => deleteEnquiry(selectedEnquiry._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                    >
                      <FiTrash2 /> Delete Lead
                    </button>
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

export default PosServices;
