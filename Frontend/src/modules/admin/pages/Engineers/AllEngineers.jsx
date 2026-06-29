import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiDownload, FiLoader, FiDollarSign, FiPower, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CardShell from '../UserCategories/components/CardShell';
import Modal from '../UserCategories/components/Modal';
import adminEngineerService from '../../../../services/adminEngineerService';

const AllEngineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Load engineers from backend
  useEffect(() => {
    loadEngineers();
  }, []);

  const loadEngineers = async () => {
    try {
      setLoading(true);
      const response = await adminEngineerService.getAllEngineers();
      if (response.success) {
        // Transform backend data to frontend format
        const transformedEngineers = response.data.map(engineer => ({
          id: engineer._id,
          name: engineer.name,
          email: engineer.email,
          phone: engineer.phone,
          serviceCategory: engineer.serviceCategory || engineer.service || 'N/A',
          approvalStatus: engineer.approvalStatus,
          aadhar: engineer.aadhar?.number,
          pan: engineer.pan?.number,
          documents: {
            aadhar: engineer.aadhar?.document,
            aadharBack: engineer.aadhar?.backDocument,
            pan: engineer.pan?.document,
            other: engineer.otherDocuments?.[0]
          },
          createdAt: engineer.createdAt,
          isActive: engineer.isActive
        }));
        setEngineers(transformedEngineers);
      } else {
        toast.error(response.message || 'Failed to load engineers');
      }
    } catch (error) {
      console.error('Error loading engineers:', error);
      toast.error('Failed to load engineers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = useMemo(() => {
    return engineers.filter(engineer => {
      const matchesStatus = filterStatus === 'all' || engineer.approvalStatus === filterStatus;
      const matchesSearch =
        engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineer.phone.includes(searchQuery) ||
        engineer.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [engineers, filterStatus, searchQuery]);

  const handleApprove = async (engineerId) => {
    try {
      const response = await adminEngineerService.approveEngineer(engineerId);
      if (response.success) {
        setEngineers(prev => prev.map(w =>
          w.id === engineerId ? { ...w, approvalStatus: 'approved' } : w
        ));
        toast.success('Engineer approved successfully!');
      } else {
        toast.error(response.message || 'Failed to approve engineer');
      }
    } catch (error) {
      console.error('Error approving engineer:', error);
      toast.error('Failed to approve engineer. Please try again.');
    }
  };

  const handleReject = async (engineerId) => {
    try {
      const response = await adminEngineerService.rejectEngineer(engineerId);
      if (response.success) {
        setEngineers(prev => prev.map(w =>
          w.id === engineerId ? { ...w, approvalStatus: 'rejected' } : w
        ));
        toast.success('Engineer rejected successfully.');
      } else {
        toast.error(response.message || 'Failed to reject engineer');
      }
    } catch (error) {
      console.error('Error rejecting engineer:', error);
      toast.error('Failed to reject engineer. Please try again.');
    }
  };

  const handleToggleStatus = async (engineerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await adminEngineerService.toggleStatus(engineerId, newStatus);
      if (response.success) {
        setEngineers(prev => prev.map(w =>
          w.id === engineerId ? { ...w, isActive: newStatus } : w
        ));
        toast.success(`Engineer ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update engineer status');
      }
    } catch (error) {
      console.error('Error toggling engineer status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (engineerId) => {
    if (!window.confirm('Are you sure you want to delete this engineer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminEngineerService.deleteEngineer(engineerId);
      if (response.success) {
        setEngineers(prev => prev.filter(w => w.id !== engineerId));
        toast.success('Engineer deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete engineer');
      }
    } catch (error) {
      console.error('Error deleting engineer:', error);
      toast.error('Failed to delete engineer');
    }
  };

  const handleViewDetails = (engineer) => {
    setSelectedEngineer(engineer);
    setIsViewModalOpen(true);
  };

  const handlePayClick = (engineer) => {
    setSelectedEngineer(engineer);
    setPayAmount('');
    setPayNotes('');
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!payAmount || isNaN(payAmount) || parseFloat(payAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setPaySubmitting(true);
      const res = await adminEngineerService.payEngineer(selectedEngineer.id, {
        amount: parseFloat(payAmount),
        notes: payNotes
      });

      if (res.success) {
        toast.success(`Payment of ₹${payAmount} recorded for ${selectedEngineer.name}`);
        setIsPayModalOpen(false);
        loadEngineers(); // Refresh data
      } else {
        toast.error(res.message || 'Failed to record payment');
      }
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setPaySubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = engineers.filter(w => w.approvalStatus === 'pending').length;
  const approvedCount = engineers.filter(w => w.approvalStatus === 'approved').length;
  const rejectedCount = engineers.filter(w => w.approvalStatus === 'rejected').length;

  return (
    <div className="space-y-4">
      <CardShell
        icon={FiFilter}
        title="Engineer Management"
        subtitle="Manage and verify platform engineers"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-1">Pending</div>
            <div className="text-xl font-bold text-yellow-900">{pendingCount}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Approved</div>
            <div className="text-xl font-bold text-green-900">{approvedCount}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Rejected</div>
            <div className="text-xl font-bold text-red-900">{rejectedCount}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search engineers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engineer Details</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-500">Loading engineers...</td>
                  </tr>
                ) : filteredEngineers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-500">No engineers found</td>
                  </tr>
                ) : (
                  filteredEngineers.map((engineer) => (
                    <tr key={engineer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{engineer.name}</p>
                          <p className="text-[10px] text-gray-500">{engineer.phone}</p>
                          <p className="text-[10px] text-gray-400">{engineer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {engineer.serviceCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${engineer.approvalStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                          engineer.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                          {engineer.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(engineer)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStatus(engineer.id, engineer.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${engineer.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={engineer.isActive ? "Disable Login" : "Enable Login"}
                          >
                            <FiPower className={`w-3.5 h-3.5 ${engineer.isActive ? 'fill-current' : ''}`} />
                          </button>



                          {/* Approve/Reject (Only for pending) */}
                          {engineer.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(engineer.id)}
                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(engineer.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Delete Engineer */}
                          <button
                            onClick={() => handleDelete(engineer.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Engineer"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
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
      </CardShell>

      {/* View Engineer Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEngineer(null);
        }}
        title="Engineer Details"
        size="lg"
      >
        {selectedEngineer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{selectedEngineer.name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{selectedEngineer.email}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <div className="text-gray-900">{selectedEngineer.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Service Category</label>
                <div className="text-gray-900">{selectedEngineer.serviceCategory}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhar</label>
                <div className="text-gray-900">{selectedEngineer.aadhar}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">PAN</label>
                <div className="text-gray-900">{selectedEngineer.pan}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <div>{getStatusBadge(selectedEngineer.approvalStatus)}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Active</label>
                <div className={`text-sm font-semibold ${selectedEngineer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedEngineer.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered</label>
                <div className="text-gray-900">
                  {new Date(selectedEngineer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Documents</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedEngineer.documents.aadhar && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Aadhar Front</label>
                    <img fetchPriority="low" loading="lazy"                       src={selectedEngineer.documents.aadhar}
                      alt="Aadhar Front"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedEngineer.documents.aadhar}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
                {selectedEngineer.documents.aadharBack && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Aadhar Back</label>
                    <img fetchPriority="low" loading="lazy"                       src={selectedEngineer.documents.aadharBack}
                      alt="Aadhar Back"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedEngineer.documents.aadharBack}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
                {selectedEngineer.documents.pan && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">PAN Document</label>
                    <img fetchPriority="low" loading="lazy"                       src={selectedEngineer.documents.pan}
                      alt="PAN"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={selectedEngineer.documents.pan}
                      download
                      className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>

            {selectedEngineer.approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    await handleApprove(selectedEngineer.id);
                    setIsViewModalOpen(false);
                    setSelectedEngineer(null);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-5 h-5" />
                  Approve Engineer
                </button>
                <button
                  onClick={async () => {
                    await handleReject(selectedEngineer.id);
                    setIsViewModalOpen(false);
                    setSelectedEngineer(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiX className="w-5 h-5" />
                  Reject Engineer
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Pay Engineer Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedEngineer(null);
        }}
        title={`Record Payment for ${selectedEngineer?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="Add payment reference or notes"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRecordPayment}
            disabled={paySubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {paySubmitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AllEngineers;
