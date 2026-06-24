import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw, 
  FiExternalLink, FiSearch, FiSliders, FiClock, FiEye, FiChevronRight,
  FiUser, FiBriefcase, FiCheck, FiX, FiInfo
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import verificationService from '../../../../services/verificationService';

const VerificationManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_verification');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Modals for reject/re-upload reasons
  const [reasonModal, setReasonModal] = useState({ show: false, docType: null, actionType: null, reason: '' });
  
  // Configuration State
  const [configRole, setConfigRole] = useState('worker');
  const [configs, setConfigs] = useState({
    worker: {
      requiredDocuments: [],
      optionalDocuments: [],
      autoVerificationEnabled: true,
      manualReviewRequired: true,
      minMatchScore: 70,
      reuploadRules: { maxAttempts: 3, coolDownHours: 24 }
    },
    engineer: {
      requiredDocuments: [],
      optionalDocuments: [],
      autoVerificationEnabled: true,
      manualReviewRequired: true,
      minMatchScore: 70,
      reuploadRules: { maxAttempts: 3, coolDownHours: 24 }
    }
  });

  // Logs State
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);

  // Document types available in the system
  const availableDocs = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'selfie', label: 'Selfie / Live Photo' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'bank_details', label: 'Bank Details' },
    { value: 'skill_certificate', label: 'Skill Certificate' },
    { value: 'experience_proof', label: 'Experience Proof' },
    { value: 'police_verification', label: 'Police Verification' },
    { value: 'education_certificate', label: 'Education Certificate' },
    { value: 'experience_certificate', label: 'Experience Certificate' },
    { value: 'resume', label: 'Resume / Portfolio' }
  ];

  // Fetch Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await verificationService.getVerifications({
        page,
        limit: 10,
        roleType: roleFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined
      });
      if (res.success) {
        setRequests(res.data || []);
        setTotalRequests(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Configurations
  const fetchConfigs = async () => {
    try {
      const res = await verificationService.getVerificationConfig();
      if (res.success && res.data) {
        const mapped = {};
        res.data.forEach(cfg => {
          mapped[cfg.roleType] = {
            requiredDocuments: cfg.requiredDocuments || [],
            optionalDocuments: cfg.optionalDocuments || [],
            autoVerificationEnabled: cfg.autoVerificationEnabled ?? true,
            manualReviewRequired: cfg.manualReviewRequired ?? true,
            minMatchScore: cfg.minMatchScore || 70,
            reuploadRules: cfg.reuploadRules || { maxAttempts: 3, coolDownHours: 24 }
          };
        });
        setConfigs(prev => ({ ...prev, ...mapped }));
      }
    } catch (err) {
      console.error('Failed to load configurations:', err);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await verificationService.getVerificationLogs({
        page: logsPage,
        limit: 20,
        status: logStatusFilter || undefined
      });
      if (res.success) {
        setLogs(res.data || []);
        setLogsTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchRequests();
    } else if (activeTab === 'config') {
      fetchConfigs();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, page, roleFilter, statusFilter, logsPage, logStatusFilter]);

  // Handle tab switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setLogsPage(1);
  };

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  // View request detail
  const handleViewDetail = async (reqId) => {
    setLoading(true);
    try {
      const res = await verificationService.getVerificationDetail(reqId);
      if (res.success) {
        setSelectedRequest(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  // Handle Config Document Checklist Selection
  const handleDocCheckboxChange = (docVal, isRequired, isChecked) => {
    const listKey = isRequired ? 'requiredDocuments' : 'optionalDocuments';
    const oppositeKey = isRequired ? 'optionalDocuments' : 'requiredDocuments';
    
    setConfigs(prev => {
      const currentRoleCfg = { ...prev[configRole] };
      
      let items = [...currentRoleCfg[listKey]];
      let oppositeItems = [...currentRoleCfg[oppositeKey]];

      if (isChecked) {
        items.push(docVal);
        // Remove from opposite list to avoid duplicates
        oppositeItems = oppositeItems.filter(item => item !== docVal);
      } else {
        items = items.filter(item => item !== docVal);
      }

      currentRoleCfg[listKey] = items;
      currentRoleCfg[oppositeKey] = oppositeItems;

      return {
        ...prev,
        [configRole]: currentRoleCfg
      };
    });
  };

  // Save Configuration Updates
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        roleType: configRole,
        ...configs[configRole]
      };
      const res = await verificationService.updateVerificationConfig(dataToSave);
      if (res.success) {
        toast.success(`${configRole.toUpperCase()} verification config updated successfully!`);
        fetchConfigs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update config');
    } finally {
      setLoading(false);
    }
  };

  // Document actions (Approve / Reject / Re-upload)
  const triggerDocAction = async (actionType, docType) => {
    if (actionType === 'approve') {
      const loadingToast = toast.loading('Approving document...');
      try {
        const res = await verificationService.approveDocument(selectedRequest.request._id, docType);
        if (res.success) {
          toast.success(`Approved ${docType} successfully!`, { id: loadingToast });
          // Refresh details
          handleViewDetail(selectedRequest.request._id);
          fetchRequests();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Approve failed', { id: loadingToast });
      }
    } else {
      setReasonModal({
        show: true,
        docType,
        actionType,
        reason: ''
      });
    }
  };

  // Submit Reject / Reupload with reason
  const handleSubmitReason = async () => {
    if (!reasonModal.reason.trim()) {
      toast.error('Please enter a reason');
      return;
    }

    const { docType, actionType, reason } = reasonModal;
    const loadingToast = toast.loading(`${actionType === 'reject' ? 'Rejecting' : 'Requesting re-upload'}...`);
    
    try {
      let res;
      if (actionType === 'reject') {
        res = await verificationService.rejectDocument(selectedRequest.request._id, docType, reason);
      } else {
        res = await verificationService.requestReupload(selectedRequest.request._id, docType, reason);
      }

      if (res.success) {
        toast.success(`Action processed successfully!`, { id: loadingToast });
        setReasonModal({ show: false, docType: null, actionType: null, reason: '' });
        // Refresh details
        handleViewDetail(selectedRequest.request._id);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed', { id: loadingToast });
    }
  };

  // Helper to style status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'success':
        return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> Verified</span>;
      case 'rejected':
      case 'failed':
        return <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><FiXCircle className="text-rose-500" /> Rejected</span>;
      case 'pending':
      case 'pending_verification':
      case 'under_review':
        return <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><FiClock className="text-amber-500" /> Pending</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><FiAlertCircle className="text-slate-500" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#0F172A] font-sans">
      
      {/* Header Cards / Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FiShield className="text-primary-600" /> Verification Control Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage Worker and Engineer profiles verification setups, live review, and logs.</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-100 bg-white p-1 rounded-xl shadow-sm max-w-fit gap-1">
        <button
          onClick={() => handleTabChange('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'pending' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Verification Requests ({totalRequests})
        </button>
        <button
          onClick={() => handleTabChange('config')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'config' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Checklist Settings
        </button>
        <button
          onClick={() => handleTabChange('logs')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'logs' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          CGPE Audit Logs
        </button>
      </div>

      {/* Active Tab View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              
              {/* Filters Panel */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, phone or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Search
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wide">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">All Roles</option>
                      <option value="worker">Worker</option>
                      <option value="engineer">Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wide">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="pending_verification">Pending Verification</option>
                      <option value="partially_verified">Partially Verified</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="">All Statuses</option>
                    </select>
                  </div>

                  <button 
                    onClick={fetchRequests} 
                    className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Refresh List"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-50 overflow-hidden">
                {requests.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <FiInfo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium">No verification requests found matching current filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="px-6 py-4">Full Name</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Documents Ratio</th>
                          <th className="px-6 py-4">Review Status</th>
                          <th className="px-6 py-4">Submitted At</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                        {requests.map(req => (
                          <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-[#0F172A]">{req.profile?.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{req.profile?.phone || req.profile?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 capitalize">{req.ownerType}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                {req.verifiedDocuments?.length} / {req.requiredDocuments?.length} Verified
                              </span>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(req.overallStatus)}</td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              {new Date(req.updatedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleViewDetail(req._id)}
                                className="bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                              >
                                Review <FiChevronRight />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST SETTINGS */}
          {activeTab === 'config' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 max-w-4xl mx-auto space-y-6">
              
              <div className="flex border-b border-slate-100 pb-4 justify-between items-center">
                <div>
                  <h3 className="font-black text-lg">Document Checklist Configurations</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Toggle and customize verification rules globally for workers and engineers.</p>
                </div>
                
                {/* Role Toggle Selector */}
                <div className="flex bg-[#F8FAFC] border border-slate-200 p-0.5 rounded-lg gap-1">
                  <button
                    onClick={() => setConfigRole('worker')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      configRole === 'worker' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Worker Role
                  </button>
                  <button
                    onClick={() => setConfigRole('engineer')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      configRole === 'engineer' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Engineer Role
                  </button>
                </div>
              </div>

              {/* Document Lists Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Required Documents */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                    <FiCheckCircle className="text-emerald-500" /> Required Documents (Mandatory)
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-admin">
                    {availableDocs.map(doc => {
                      const isChecked = configs[configRole].requiredDocuments.includes(doc.value);
                      return (
                        <label key={doc.value} className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleDocCheckboxChange(doc.value, true, e.target.checked)}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-semibold">{doc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Documents */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                    <FiInfo className="text-primary-500" /> Optional / Proofs Only (Non-Mandatory)
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-admin">
                    {availableDocs.map(doc => {
                      const isChecked = configs[configRole].optionalDocuments.includes(doc.value);
                      return (
                        <label key={doc.value} className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleDocCheckboxChange(doc.value, false, e.target.checked)}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-semibold">{doc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Flow Rules */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FiSliders className="text-slate-500" /> Matching & Review Rules
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-slate-50">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Auto Verification (CGPE API)</p>
                        <p className="text-xs text-slate-400">Trigger CGPE verification algorithms automatically</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={configs[configRole].autoVerificationEnabled}
                        onChange={(e) => setConfigs(prev => ({
                          ...prev,
                          [configRole]: { ...prev[configRole], autoVerificationEnabled: e.target.checked }
                        }))}
                        className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-slate-50">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Admin Manual Approval Required</p>
                        <p className="text-xs text-slate-400">Review documents before locking profile state</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={configs[configRole].manualReviewRequired}
                        onChange={(e) => setConfigs(prev => ({
                          ...prev,
                          [configRole]: { ...prev[configRole], manualReviewRequired: e.target.checked }
                        }))}
                        className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Score & Threshold Limits */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FiClock className="text-slate-500" /> Thresholds & Re-upload Logic
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Min Face Match Score</label>
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{configs[configRole].minMatchScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={configs[configRole].minMatchScore}
                        onChange={(e) => setConfigs(prev => ({
                          ...prev,
                          [configRole]: { ...prev[configRole], minMatchScore: parseInt(e.target.value) }
                        }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Max Re-upload Attempts</label>
                        <input
                          type="number"
                          value={configs[configRole].reuploadRules.maxAttempts}
                          onChange={(e) => setConfigs(prev => {
                            const newCfg = { ...prev[configRole] };
                            newCfg.reuploadRules.maxAttempts = parseInt(e.target.value) || 3;
                            return { ...prev, [configRole]: newCfg };
                          })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Cooldown Period (Hours)</label>
                        <input
                          type="number"
                          value={configs[configRole].reuploadRules.coolDownHours}
                          onChange={(e) => setConfigs(prev => {
                            const newCfg = { ...prev[configRole] };
                            newCfg.reuploadRules.coolDownHours = parseInt(e.target.value) || 24;
                            return { ...prev, [configRole]: newCfg };
                          })}
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit Config Button */}
              <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <FiRefreshCw className="animate-spin" /> : <FiCheck />} Save Configurations
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: CGPE AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              
              {/* Logs Filter */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">API Status</label>
                  <select
                    value={logStatusFilter}
                    onChange={(e) => setLogStatusFilter(e.target.value)}
                    className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">All Logs</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                  <span>Total calls logged: {logsTotal}</span>
                </div>
              </div>

              {/* Logs Table List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-50 overflow-hidden">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <FiInfo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium">No API verification logs found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {logs.map(log => {
                      const isExpanded = expandedLog === log._id;
                      return (
                        <div key={log._id} className="hover:bg-slate-50/50 transition-colors p-4 space-y-3">
                          
                          {/* Log Main Summary */}
                          <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedLog(isExpanded ? null : log._id)}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  log.ownerType === 'engineer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                  {log.ownerType}
                                </span>
                                <span className="text-sm font-bold capitalize text-[#0F172A]">{log.documentType} Verification</span>
                                <span className="text-xs text-slate-400 font-medium">({log.apiType})</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-400">
                                User ID: {log.ownerId} • IP/Trace ID: {log._id}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <p className="text-xs text-slate-400">
                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                              </p>
                              {getStatusBadge(log.status)}
                            </div>
                          </div>

                          {/* Expandable Request/Response details */}
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="bg-slate-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono overflow-hidden"
                            >
                              <div className="space-y-1.5">
                                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Request Payload</p>
                                <pre className="bg-[#0F172A] text-emerald-400 p-3 rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
                                  {JSON.stringify(log.requestPayload, null, 2)}
                                </pre>
                              </div>

                              <div className="space-y-1.5">
                                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Response Payload / Error</p>
                                {log.status === 'failed' ? (
                                  <pre className="bg-rose-950 text-rose-300 p-3 rounded-lg overflow-x-auto border border-rose-900 leading-relaxed max-h-56">
                                    {log.errorMessage || 'No error details recorded.'}
                                  </pre>
                                ) : (
                                  <pre className="bg-[#0F172A] text-emerald-400 p-3 rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
                                    {JSON.stringify(log.responsePayload, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </motion.div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {logsTotal > 20 && (
                <div className="flex justify-between items-center px-4">
                  <button 
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-bold">Page {logsPage} of {Math.ceil(logsTotal / 20)}</span>
                  <button 
                    disabled={logsPage >= Math.ceil(logsTotal / 20)}
                    onClick={() => setLogsPage(p => p + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* DRAWER: DETAILED REVIEW FOR PENDING REQUEST */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />

            {/* Side Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    Review Verification Request
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold">
                    Submitted by {selectedRequest.profile?.name} • ID: {selectedRequest.request.ownerId}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
                >
                  <FiX />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-admin">
                
                {/* Profile Card Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Details</p>
                    <p className="text-sm font-bold text-slate-800">{selectedRequest.profile?.name}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.profile?.phone}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.profile?.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Registration Info</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{selectedRequest.request.ownerType}</p>
                    <p className="text-xs text-slate-500">Service Category: {selectedRequest.profile?.serviceCategory || 'Not Selected'}</p>
                    <p className="text-xs text-slate-500">Address: {selectedRequest.profile?.address?.city || 'No Location'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedRequest.request.overallStatus)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">
                      {selectedRequest.request.verifiedDocuments?.length} of {selectedRequest.request.requiredDocuments?.length} mandatory verified
                    </p>
                  </div>
                </div>

                {/* Documents Checker Checklist */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-800 text-sm">Uploaded Documents Status</h4>
                  
                  <div className="space-y-4">
                    {selectedRequest.documents.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-slate-200 text-slate-500 rounded-xl">
                        No documents have been uploaded by this user yet.
                      </div>
                    ) : (
                      selectedRequest.documents.map(doc => (
                        <div key={doc._id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          
                          {/* Doc Banner / Summary */}
                          <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold capitalize text-sm">{doc.documentType.replace('_', ' ')}</h5>
                                <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">{doc.documentNumberMasked || 'No Doc Number'}</span>
                              </div>
                              {doc.matchScore && (
                                <p className="text-xs font-semibold flex items-center gap-1.5">
                                  Face Match Score: 
                                  <span className={`font-bold ${doc.matchScore >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {doc.matchScore}%
                                  </span>
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {getStatusBadge(doc.status)}
                              
                              {/* Quick Action Button Dropdowns */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => triggerDocAction('approve', doc.documentType)}
                                  disabled={doc.status === 'verified'}
                                  className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white p-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-100 disabled:opacity-40 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-600 flex items-center gap-1"
                                  title="Approve Document"
                                >
                                  <FiCheck /> Approve
                                </button>

                                <button
                                  onClick={() => triggerDocAction('reject', doc.documentType)}
                                  disabled={doc.status === 'rejected'}
                                  className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-1.5 rounded-lg text-xs font-bold transition-all border border-rose-100 disabled:opacity-40 disabled:hover:bg-rose-50 disabled:hover:text-rose-600 flex items-center gap-1"
                                  title="Reject Document"
                                >
                                  <FiX /> Reject
                                </button>

                                <button
                                  onClick={() => triggerDocAction('reupload', doc.documentType)}
                                  className="bg-slate-100 hover:bg-slate-600 hover:text-white text-slate-700 p-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center gap-1"
                                  title="Request Re-upload"
                                >
                                  <FiRefreshCw /> Re-upload
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Doc Preview / Cloudinary + API Details */}
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* File Preview */}
                            <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-xl flex flex-col items-center justify-center relative min-h-64 group">
                              <img 
                                src={doc.signedPreviewUrl || doc.fileUrl} 
                                alt={doc.documentType} 
                                className="max-h-60 object-contain rounded shadow-sm bg-white" 
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <div className="mt-3 flex items-center gap-2">
                                <a 
                                  href={doc.signedPreviewUrl || doc.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                  Open Secured File <FiExternalLink />
                                </a>
                              </div>
                            </div>

                            {/* API Verification Details Payload */}
                            <div className="bg-[#0F172A] text-slate-300 p-4 rounded-xl border border-slate-800 flex flex-col min-h-64">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FiInfo /> CGPE API Verification Payload
                              </p>
                              
                              {doc.cgpeResponse ? (
                                <div className="flex-1 overflow-y-auto max-h-56 pr-2 scrollbar-admin text-xs font-mono space-y-3 leading-relaxed">
                                  {Object.keys(doc.cgpeResponse).map(key => (
                                    <div key={key} className="border-b border-slate-800 pb-1.5">
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key}</p>
                                      <p className="text-emerald-400 font-semibold mt-0.5">
                                        {typeof doc.cgpeResponse[key] === 'object' 
                                          ? JSON.stringify(doc.cgpeResponse[key]) 
                                          : String(doc.cgpeResponse[key])}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-4">
                                  <FiAlertCircle className="w-8 h-8 mb-2" />
                                  <p className="text-xs">No instant API verification payload recorded. Requires manual review or CGPE retry.</p>
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* REASON MODAL FOR REJECTION / REUPLOAD */}
      {reasonModal.show && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-50 space-y-4">
            <div>
              <h4 className="font-black text-base flex items-center gap-2 capitalize">
                {reasonModal.actionType === 'reject' ? <FiXCircle className="text-rose-500" /> : <FiRefreshCw className="text-primary-500" />}
                {reasonModal.actionType === 'reject' ? 'Reject Document' : 'Request Document Re-upload'}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">Please provide a descriptive reason for rejecting this {reasonModal.docType} upload.</p>
            </div>

            <textarea
              rows="4"
              value={reasonModal.reason}
              onChange={(e) => setReasonModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter rejection details or clear instructions for user to re-upload..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setReasonModal({ show: false, docType: null, actionType: null, reason: '' })}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReason}
                className="px-4 py-2 rounded-lg text-sm bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VerificationManagement;
