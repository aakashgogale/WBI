import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiSearch, FiEye, FiTrash2, FiX, 
  FiPhoneCall, FiDownload, FiMapPin, FiBox, 
  FiAlertTriangle, FiClock, FiActivity, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const BreakdownEnquiries = () => {
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
      const res = await api.get('/admin/breakdown-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch Breakdown enquiries');
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
      const res = await api.put(`/admin/breakdown-enquiries/${id}/status`, { status: newStatus });
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
      const res = await api.delete(`/admin/breakdown-enquiries/${id}`);
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
      'New': 'bg-red-100 text-red-700 border-red-200 animate-pulse',
      'Engineer Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
      'Parts Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Resolved': 'bg-green-100 text-green-700 border-green-200',
      'Closed': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['New']}`}>{status}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency.includes('Emergency')) return <span className="text-white bg-red-600 px-2 py-1 rounded text-xs font-bold">Emergency</span>;
    if (urgency.includes('Urgent')) return <span className="text-white bg-orange-500 px-2 py-1 rounded text-xs font-bold">Urgent</span>;
    if (urgency.includes('High')) return <span className="text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded text-xs font-medium">High</span>;
    return <span className="text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-medium">Normal/Flex</span>;
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
          <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2"><FiAlertTriangle /> Breakdown Calls</h1>
          <p className="text-gray-500 mt-1">Manage emergency security system repair requests</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search breakdowns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Engineer Assigned">Engineer Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Parts Pending">Parts Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-red-50 border-b border-red-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800">Urgency</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800">Client Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800">Fault Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800">System Down?</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading breakdowns...</td></tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No breakdown calls found.</td></tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4">
                      {getUrgencyBadge(enquiry.urgency)}
                      <div className="text-xs text-gray-500 mt-2">{new Date(enquiry.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{enquiry.fullName}</div>
                      <div className="text-xs text-gray-500">{enquiry.siteAddress}, {enquiry.city}</div>
                      {enquiry.siteOperational === 'No' && <span className="text-xs text-red-500 font-bold">Business Stopped</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{enquiry.typeOfIssue}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{enquiry.faultDescription}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${enquiry.systemDownStatus === 'Entire system' ? 'text-red-600' : 'text-orange-500'}`}>{enquiry.systemDownStatus}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedEnquiry(enquiry); setIsModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="View Details">
                          <FiEye className="text-lg" />
                        </button>
                        <button onClick={() => handleDelete(enquiry._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-red-200">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-red-50">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                  <FiAlertTriangle /> Emergency Breakdown Call
                </h2>
                <div className="mt-1">{getUrgencyBadge(selectedEnquiry.urgency)}</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Col 1 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm border-l-4 border-l-red-500">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiMapPin className="text-red-500" /> Client & Site</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-bold text-gray-800">{selectedEnquiry.fullName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Urgent Alt:</span> <span className="font-bold text-red-600">{selectedEnquiry.alternateContact}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEnquiry.phone}</span></div>
                      {selectedEnquiry.companyName && <div className="flex justify-between"><span className="text-gray-500">Company:</span> <span className="font-medium">{selectedEnquiry.companyName}</span></div>}
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Site Details:</span>
                        <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{selectedEnquiry.siteAddress}, {selectedEnquiry.city}</p>
                        <div className="mt-2 text-xs">
                          <div>Type: {selectedEnquiry.siteType}</div>
                          <div className={`mt-1 font-bold ${selectedEnquiry.siteOperational === 'No' ? 'text-red-500' : 'text-green-600'}`}>Business Running? {selectedEnquiry.siteOperational}</div>
                          <div className={`mt-1 font-bold ${selectedEnquiry.highSecurity === 'Yes' ? 'text-red-500' : ''}`}>High Security? {selectedEnquiry.highSecurity}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm border-orange-200 bg-orange-50/30">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2 text-orange-700"><FiActivity className="text-orange-500" /> Breakdown Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Issue:</span> <span className="font-bold text-red-600">{selectedEnquiry.typeOfIssue}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Brand:</span> <span className="font-medium">{selectedEnquiry.equipmentBrand}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Units Down:</span> <span className="font-bold">{selectedEnquiry.devicesAffectedCount}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Power Supply:</span> <span className="font-medium">{selectedEnquiry.powerSupplyStatus}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedEnquiry.breakdownTime}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Before fault:</span> <span className="font-medium">{selectedEnquiry.beforeBreakdown}</span></div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Fault Description:</span>
                        <p className="font-medium text-gray-800 bg-white border p-2 rounded text-xs">{selectedEnquiry.faultDescription}</p>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Visible Damage:</span>
                        <p className="font-medium text-red-500 text-xs">{selectedEnquiry.visibleDamage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 3 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiShield className="text-indigo-500" /> Impact & History</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">System Down:</span> <span className="font-bold text-red-500">{selectedEnquiry.systemDownStatus}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Biz Impact:</span> <span className="font-bold">{selectedEnquiry.affectingBusiness}</span></div>
                      {selectedEnquiry.securityRisk === 'Yes' && (
                        <div className="bg-red-50 p-2 rounded text-red-700 text-xs mt-1 border border-red-100">
                          <strong>Security Risk:</strong> {selectedEnquiry.riskDescription}
                        </div>
                      )}
                      <div className="pt-2 border-t mt-2">
                        <span className="font-bold mb-1 block">Service History</span>
                        <div className="flex justify-between"><span className="text-gray-500">Happened Before:</span> <span>{selectedEnquiry.happenedBefore}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">WBI Install:</span> <span>{selectedEnquiry.installedByWbi}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Warranty:</span> <span>{selectedEnquiry.underWarranty}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Has AMC:</span> <span className="font-bold text-orange-600">{selectedEnquiry.existingAmc}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 4 */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2"><FiClock className="text-blue-500" /> Action & Resolution</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Outcome Expected:</span> <span className="font-medium">{selectedEnquiry.expectedOutcome}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Spare Parts Cost:</span> <span className="font-medium text-blue-600">{selectedEnquiry.okayWithSpareCost}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget:</span> <span className="font-bold text-green-600">{selectedEnquiry.expectedBudget}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Future AMC:</span> <span className="font-medium">{selectedEnquiry.interestedInAmc}</span></div>
                      
                      <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between"><span className="text-gray-500">Site Contact:</span> <span>{selectedEnquiry.siteContactName || selectedEnquiry.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Contact Number:</span> <span className="font-bold">{selectedEnquiry.siteContactNumber || selectedEnquiry.phone}</span></div>
                      </div>
                    </div>
                  </div>

                  {selectedEnquiry.attachments?.length > 0 && (
                    <div className="bg-white p-5 rounded-xl border shadow-sm border-red-100">
                      <h3 className="font-bold mb-4 pb-2 border-b flex items-center gap-2 text-red-600"><FiAlertTriangle /> Fault Evidence</h3>
                      <div className="space-y-2">
                        {selectedEnquiry.attachments.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">
                            <span className="text-xs truncate mr-2 text-red-700">{file.filename || `File ${i + 1}`}</span>
                            <FiDownload className="text-red-500 flex-shrink-0" />
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
                  {['New', 'Engineer Assigned', 'In Progress', 'Parts Pending', 'Resolved', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, status)}
                      disabled={updatingId === selectedEnquiry._id}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedEnquiry.status === status 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'bg-white border text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <a 
                href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hi ${selectedEnquiry.fullName}, WBI Breakdown Response Team here regarding your emergency at ${selectedEnquiry.siteAddress}...`}
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

export default BreakdownEnquiries;
