import React, { useState, useEffect } from 'react';
import { 
  FiBriefcase, FiCheck, FiX, FiInfo, FiFileText, FiMapPin, 
  FiClock, FiTrendingUp, FiSearch, FiExternalLink, FiUser 
} from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const B2BManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspect dialog
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // Rejection dialog
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectedDocs, setRejectedDocs] = useState([]); // List of documentTypes to reject

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/b2b-companies', {
        params: {
          verificationStatus: selectedStatus,
          search: searchQuery
        }
      });
      if (res.data.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load B2B companies list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/admin/b2b-companies/${id}/approve`);
      if (res.data.success) {
        toast.success('B2B company approved successfully!');
        setSelectedCompany(null);
        fetchCompanies();
      }
    } catch (err) {
      toast.error('Failed to approve company');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      const res = await api.patch(`/admin/b2b-companies/${selectedCompany._id}/reject`, {
        rejectionReason,
        rejectedDocuments: rejectedDocs
      });

      if (res.data.success) {
        toast.success('B2B company rejected successfully');
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectedDocs([]);
        setSelectedCompany(null);
        fetchCompanies();
      }
    } catch (err) {
      toast.error('Failed to reject company');
    }
  };

  const toggleRejectDoc = (docType) => {
    if (rejectedDocs.includes(docType)) {
      setRejectedDocs(rejectedDocs.filter(d => d !== docType));
    } else {
      setRejectedDocs([...rejectedDocs, docType]);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-gray-800">B2B Onboarding approvals</h2>
          <p className="text-xs text-gray-500 mt-1">Review new partner company accounts, verify documents, and approve or reject applications.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Switch tabs */}
        <div className="flex gap-2">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved Partners' },
            { id: 'rejected', label: 'Rejected Profiles' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setSelectedStatus(tab.id); setSelectedCompany(null); }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                selectedStatus === tab.id 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, GST, PAN..."
            className="w-full h-9 bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
          />
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table list */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${
          selectedCompany ? 'lg:col-span-6' : 'lg:col-span-12'
        }`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-xs font-bold">
              No companies currently listed in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Company Details</th>
                    <th className="p-4">GST/PAN Numbers</th>
                    <th className="p-4">Branches</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {companies.map((c) => (
                    <tr 
                      key={c._id} 
                      className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${
                        selectedCompany?._id === c._id ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => setSelectedCompany(c)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {c.companyName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800 text-xs">{c.companyName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{c.email} &bull; {c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-[10px]">GST: <span className="font-bold text-gray-800">{c.gstNumber}</span></p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PAN: <span className="font-bold text-gray-600">{c.panNumber}</span></p>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {c.branches?.length || 0} branches
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                          c.verificationStatus === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : c.verificationStatus === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                        }`}>
                          {c.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedCompany(c); }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-wider"
                        >
                          Inspect &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Pane */}
        {selectedCompany && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Partner Profile Inspect</h3>
                <span className="text-[10px] text-gray-400">Review document scans and operational settings.</span>
              </div>
              <button 
                onClick={() => setSelectedCompany(null)}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 leading-relaxed font-semibold">
              <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="font-bold text-gray-800 text-sm">{selectedCompany.companyName}</p>
                <p className="text-[10px] text-gray-500 mt-1">TAN: {selectedCompany.tanNumber} &bull; CIN: {selectedCompany.cinNumber || 'N/A'}</p>
                <p className="text-[10px] text-gray-400 mt-1">HQ Address: {selectedCompany.companyAddress}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Authorized Officer</span>
                <p className="font-bold text-gray-800 mt-1">{selectedCompany.authorizedPerson?.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{selectedCompany.authorizedPerson?.designation}</p>
                <p className="text-[10px] text-gray-400 mt-1">Phone: {selectedCompany.authorizedPerson?.phone}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Billing Address</span>
                <p className="text-[10px] text-gray-600 mt-1 leading-snug">{selectedCompany.billingAddress}</p>
              </div>
            </div>

            {/* Document Scans list */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Uploaded Document Scans</span>
              
              <div className="space-y-2">
                {selectedCompany.documents?.map((doc) => {
                  const docLabel = doc.documentType.replace(/([A-Z])/g, ' $1');
                  return (
                    <div key={doc.documentType} className="border border-gray-100 bg-gray-50/50 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-800 capitalize">{docLabel}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block ${
                          doc.status === 'verified' 
                            ? 'bg-green-100 text-green-700' 
                            : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white hover:bg-blue-50 border border-gray-200 text-blue-600 p-2 rounded-xl flex items-center justify-center gap-1 text-[10px] font-bold transition-colors"
                      >
                        <FiExternalLink />
                        View Scan
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Controls */}
            {selectedCompany.verificationStatus === 'pending' && (
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(true); setRejectedDocs([]); }}
                  className="flex-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FiX /> Reject Onboarding
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedCompany._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <FiCheck /> Approve Partner
                </button>
              </div>
            )}

            {selectedCompany.verificationStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-700 text-xs font-semibold">
                <FiInfo className="inline w-4 h-4 mr-2 -mt-0.5" />
                <span>Rejected application. Rejection reason: "{selectedCompany.rejectionReason}"</span>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Rejection Modal Dialog */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800">Verify Rejection Details</h3>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              
              {/* Select documents to reject */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select specific rejected documents (Optional)</label>
                <div className="space-y-1.5">
                  {selectedCompany.documents?.map(doc => (
                    <label key={doc.documentType} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600">
                      <input 
                        type="checkbox"
                        checked={rejectedDocs.includes(doc.documentType)}
                        onChange={() => toggleRejectDoc(doc.documentType)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="capitalize">{doc.documentType.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Rejection feedback reason *</label>
                <textarea 
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the documents or profile were rejected..."
                  className="w-full h-24 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Reject Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default B2BManagement;
