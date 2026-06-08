import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiEye, FiTrash2, FiX, 
  FiPhoneCall, FiDownload, FiMapPin, FiBox, 
  FiSettings, FiTool, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const MaintenanceEnquiries = () => {
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
      const res = await api.get('/admin/maintenance-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch Maintenance enquiries');
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
      const res = await api.put(`/admin/maintenance-enquiries/${id}/status`, { status: newStatus });
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
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const res = await api.delete(`/admin/maintenance-enquiries/${id}`);
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

  const getStatusBadge = (status) => {
    const styles = {
      'New': 'bg-blue-100 text-blue-700 border-blue-200',
      'Site Visit Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
      'Quote Sent': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'AMC Signed': 'bg-teal-100 text-teal-700 border-teal-200',
      'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['New']}`}>{status}</span>;
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || enq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Preventive Maintenance</h1>
          <p className="text-gray-500 mt-1">Manage AMC and health check requests</p>
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
            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
            <option value="Quote Sent">Quote Sent</option>
            <option value="AMC Signed">AMC Signed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Site & AMC</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Frequency</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading enquiries...</td></tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No maintenance enquiries found.</td></tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{enquiry.fullName}</div>
                      <div className="text-sm text-gray-500">{enquiry.companyName || enquiry.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{enquiry.siteType}</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">{enquiry.lookingForAmc === 'Yes' ? 'Seeking AMC' : 'One-Time'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">{enquiry.maintenanceFrequency}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedEnquiry(enquiry); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
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
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiFileText className="text-[#10AFA5]" /> Maintenance Enquiry Details
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Col 1 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiMapPin className="text-blue-500" /> Client Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.fullName}</span></div>
                      {selectedEnquiry.companyName && <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedEnquiry.companyName}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium truncate max-w-[150px]">{selectedEnquiry.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Site Address:</span>
                        <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{selectedEnquiry.siteAddress}, {selectedEnquiry.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiBox className="text-purple-500" /> Site Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedEnquiry.siteType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Size:</span> <span className="font-medium">{selectedEnquiry.siteSize}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Locations:</span> <span className="font-medium text-blue-600">{selectedEnquiry.numberOfLocations}</span></div>
                    </div>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiSettings className="text-orange-500" /> Equipment Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Units:</span> <span className="font-bold text-gray-800">{selectedEnquiry.totalDevices}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Age:</span> <span className="font-medium">{selectedEnquiry.equipmentAge}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className="font-medium">{selectedEnquiry.equipmentWorkingStatus}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">WBI Install:</span> <span className="font-medium">{selectedEnquiry.installedByUs}</span></div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-2">Systems to Maintain:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEnquiry.equipmentType?.map(e => <span key={e} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs border border-orange-200">{e}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiCalendar className="text-indigo-500" /> Service History</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Prior Maint:</span> <span className="font-medium">{selectedEnquiry.maintenanceDoneBefore}</span></div>
                      {selectedEnquiry.lastMaintenanceDate && <div className="flex justify-between"><span className="text-gray-500">Last Date:</span> <span className="font-medium">{new Date(selectedEnquiry.lastMaintenanceDate).toLocaleDateString()}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-500">Existing AMC:</span> <span className="font-medium text-red-500">{selectedEnquiry.existingAmc}</span></div>
                      {selectedEnquiry.currentAmcProvider && <div className="flex justify-between"><span className="text-gray-500">AMC Provider:</span> <span className="font-medium">{selectedEnquiry.currentAmcProvider}</span></div>}
                    </div>
                  </div>
                </div>

                {/* Col 3 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm border-teal-100">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2 text-teal-700"><FiTool className="text-teal-500" /> Needs & AMC Request</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Frequency:</span> <span className="font-bold text-teal-700">{selectedEnquiry.maintenanceFrequency}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Want AMC:</span> <span className="font-bold text-teal-700">{selectedEnquiry.lookingForAmc}</span></div>
                      {selectedEnquiry.lookingForAmc === 'Yes' && (
                        <>
                          <div className="flex justify-between"><span className="text-gray-500">AMC Type:</span> <span className="font-medium">{selectedEnquiry.amcTypePreferred}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Duration:</span> <span className="font-medium">{selectedEnquiry.amcDurationPreferred}</span></div>
                        </>
                      )}
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-2">Required Tasks:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedEnquiry.maintenanceNeeded?.map(e => <span key={e} className="bg-gray-100 px-2 py-1 rounded text-xs border">{e}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 4 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiDollarSign className="text-green-500" /> Budget & Logistics</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">1x Budget:</span> <span className="font-medium text-green-600">{selectedEnquiry.budgetOneTime}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">AMC Budget:</span> <span className="font-bold text-green-600">{selectedEnquiry.budgetAnnualAmc}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Visit Date:</span> <span className="font-medium">{selectedEnquiry.preferredVisitDate ? new Date(selectedEnquiry.preferredVisitDate).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedEnquiry.preferredTimeSlot}</span></div>
                      {selectedEnquiry.additionalNotes && (
                        <div className="pt-2 border-t mt-2">
                          <span className="text-gray-500 block mb-1">Notes:</span>
                          <p className="font-medium text-gray-700 bg-yellow-50 p-2 rounded text-xs">{selectedEnquiry.additionalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEnquiry.attachments?.length > 0 && (
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="font-bold mb-4 pb-2 border-b">Attachments ({selectedEnquiry.attachments.length})</h3>
                      <div className="space-y-2">
                        {selectedEnquiry.attachments.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-xs truncate mr-2">{file.filename || `File ${i + 1}`}</span>
                            <FiDownload className="text-[#10AFA5] flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="px-8 py-5 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Update Status:</span>
                <div className="flex gap-2">
                  {['New', 'Site Visit Scheduled', 'Quote Sent', 'AMC Signed', 'In Progress', 'Completed', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, status)}
                      disabled={updatingId === selectedEnquiry._id}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
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
                href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hi ${selectedEnquiry.fullName}, regarding your Preventive Maintenance Request...`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors ml-4 shrink-0"
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

export default MaintenanceEnquiries;
