import React, { useState, useEffect } from 'react';
import { FiEye, FiDownload, FiX, FiCheckCircle, FiClock, FiTool, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const HcPreventiveMaintenanceEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/admin/hcpm-enquiries');
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/admin/hcpm-enquiries/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Status updated');
        fetchEnquiries();
        setSelectedEnquiry(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Report Generation': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Preventive Maintenance Enquiries</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Client</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Organization</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Total Units</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : enquiries.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No enquiries found</td></tr>
                ) : (
                  enquiries.map((enq) => (
                    <tr key={enq._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{new Date(enq.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{enq.fullName}</p>
                        <p className="text-xs text-gray-500">{enq.phone}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{enq.organizationName}</td>
                      <td className="p-4 text-sm text-gray-600">{enq.totalUnits}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enq.status)}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="p-2 text-[#10AFA5] hover:bg-[#E8F5F1] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">Enquiry Details</h2>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Status Update */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#10AFA5]"
                    value={selectedEnquiry.status}
                    onChange={(e) => updateStatus(selectedEnquiry._id, e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Report Generation">Report Generation</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Client Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{selectedEnquiry.fullName}</p></div>
                  <div><p className="text-gray-500">Organization</p><p className="font-medium">{selectedEnquiry.organizationName}</p></div>
                  <div><p className="text-gray-500">Designation</p><p className="font-medium">{selectedEnquiry.designation}</p></div>
                  <div><p className="text-gray-500">Phone</p><p className="font-medium">{selectedEnquiry.phone}</p></div>
                  <div><p className="text-gray-500">Email</p><p className="font-medium">{selectedEnquiry.email}</p></div>
                  <div><p className="text-gray-500">City</p><p className="font-medium">{selectedEnquiry.city}</p></div>
                  <div className="col-span-2 md:col-span-3"><p className="text-gray-500">Site Address</p><p className="font-medium">{selectedEnquiry.siteAddress}</p></div>
                </div>
              </div>

              {/* Facility Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Facility Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Facility Type</p><p className="font-medium">{selectedEnquiry.facilityType}</p></div>
                  <div><p className="text-gray-500">Facility Size</p><p className="font-medium">{selectedEnquiry.facilitySize}</p></div>
                  <div><p className="text-gray-500">Departments Count</p><p className="font-medium">{selectedEnquiry.departmentsCount}</p></div>
                  <div><p className="text-gray-500">Locations Count</p><p className="font-medium">{selectedEnquiry.locationsCount}</p></div>
                  <div><p className="text-gray-500">Is Accredited?</p><p className="font-medium">{selectedEnquiry.isAccredited}</p></div>
                </div>
              </div>

              {/* Equipment Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Equipment Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-gray-500 mb-1">Equipment Category</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnquiry.equipmentCategory?.map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div><p className="text-gray-500">Total Units</p><p className="font-medium">{selectedEnquiry.totalUnits}</p></div>
                  <div><p className="text-gray-500">Equipment Brands</p><p className="font-medium">{selectedEnquiry.equipmentBrands}</p></div>
                  <div><p className="text-gray-500">Age Range</p><p className="font-medium">{selectedEnquiry.equipmentAgeRange}</p></div>
                  <div><p className="text-gray-500">Equipment List Available?</p><p className="font-medium">{selectedEnquiry.equipmentListAvailable}</p></div>
                </div>
              </div>

              {/* Maintenance History */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Maintenance History</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">PM Currently Done?</p><p className="font-medium">{selectedEnquiry.isPmCurrentlyDone}</p></div>
                  <div><p className="text-gray-500">Who is doing PM?</p><p className="font-medium">{selectedEnquiry.whoIsDoingPm || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Last PM Done Date</p><p className="font-medium">{selectedEnquiry.lastPmDoneDate || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Any Existing AMC?</p><p className="font-medium">{selectedEnquiry.anyExistingAmc}</p></div>
                  <div><p className="text-gray-500">Provider & Expiry Date</p><p className="font-medium">{selectedEnquiry.providerExpiryDate || 'N/A'}</p></div>
                  <div><p className="text-gray-500">Breakdowns/Month</p><p className="font-medium">{selectedEnquiry.breakdownCallsPerMonth || 'N/A'}</p></div>
                  <div className="col-span-2 md:col-span-3"><p className="text-gray-500">Current Issues</p><p className="font-medium p-3 bg-gray-50 rounded-lg">{selectedEnquiry.currentIssues || 'N/A'}</p></div>
                </div>
              </div>

              {/* Maintenance Requirements */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Maintenance Requirements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-gray-500 mb-1">Maintenance Activities Needed</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnquiry.maintenanceActivitiesNeeded?.map((srv, i) => (
                        <span key={i} className="px-3 py-1 bg-[#E8F5F1] text-[#10AFA5] rounded-full text-xs font-medium">{srv}</span>
                      ))}
                    </div>
                  </div>
                  <div><p className="text-gray-500">Maintenance Frequency</p><p className="font-medium">{selectedEnquiry.maintenanceFrequency}</p></div>
                  <div><p className="text-gray-500">Need PM Report?</p><p className="font-medium">{selectedEnquiry.needPmReportAfterVisit}</p></div>
                  <div><p className="text-gray-500">Need Equipment History?</p><p className="font-medium">{selectedEnquiry.needEquipmentHistory}</p></div>
                </div>
              </div>

              {/* Schedule & Preferences */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Schedule & Preferences</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Preferred Visit Date</p><p className="font-medium">{selectedEnquiry.preferredFirstVisitDate ? new Date(selectedEnquiry.preferredFirstVisitDate).toLocaleDateString() : 'N/A'}</p></div>
                  <div><p className="text-gray-500">Preferred Time Slot</p><p className="font-medium">{selectedEnquiry.preferredTimeSlot}</p></div>
                  <div><p className="text-gray-500">Working Hours Maintenance?</p><p className="font-medium">{selectedEnquiry.workingHoursMaintenance}</p></div>
                  <div><p className="text-gray-500">Site Contact Name</p><p className="font-medium">{selectedEnquiry.siteContactName}</p></div>
                  <div><p className="text-gray-500">Site Contact Number</p><p className="font-medium">{selectedEnquiry.siteContactNumber}</p></div>
                  <div><p className="text-gray-500">Access Restriction</p><p className="font-medium">{selectedEnquiry.accessRestriction}</p></div>
                  <div><p className="text-gray-500">Urgency</p><p className="font-medium">{selectedEnquiry.urgency}</p></div>
                  <div><p className="text-gray-500">Budget Per Visit</p><p className="font-medium">{selectedEnquiry.budgetPerVisit}</p></div>
                  <div><p className="text-gray-500">Interested in Full AMC?</p><p className="font-medium">{selectedEnquiry.interestedInFullAmc}</p></div>
                  <div className="col-span-2 md:col-span-3"><p className="text-gray-500">Additional Notes</p><p className="font-medium p-3 bg-gray-50 rounded-lg">{selectedEnquiry.additionalNotes || 'N/A'}</p></div>
                </div>
              </div>

              {/* Attachments */}
              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Attachments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedEnquiry.attachments.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#10AFA5] transition-colors group">
                        {file.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={file.url} alt="Attachment" className="w-full h-24 object-cover rounded-lg mb-2" />
                        ) : (
                          <FiFileText className="text-4xl text-gray-400 mb-2 group-hover:text-[#10AFA5]" />
                        )}
                        <span className="text-xs text-gray-500 truncate w-full text-center" title={file.filename}>{file.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HcPreventiveMaintenanceEnquiries;
