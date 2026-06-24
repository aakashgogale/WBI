import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUploadCloud, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, 
  FiUser, FiFileText, FiBookOpen, FiArrowLeft, FiCamera, FiRefreshCw,
  FiLock, FiGrid
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import verificationService from '../../../../services/verificationService';
import flutterBridge from '../../../../utils/flutterBridge';

const Documents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  
  // File upload state
  const [uploadingDoc, setUploadingDoc] = useState(null);
  
  // Instant validation states
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [panInput, setPanInput] = useState({ panNumber: '', fullName: '', dob: '' });
  const [bankInput, setBankInput] = useState({ accountNumber: '', ifsc: '', accountHolderName: '' });
  const [validating, setValidating] = useState(null); // 'aadhaar' | 'pan' | 'bank' | 'selfie'
  
  const fetchStatus = async () => {
    try {
      const res = await verificationService.getMyStatus();
      if (res.success) {
        setStatusData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load document statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle uploader trigger
  const handleUpload = async (docType, e) => {
    let file = null;
    if (e && e.target && e.target.files) {
      file = e.target.files[0];
    } else {
      file = await flutterBridge.openCamera();
    }

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingDoc(docType);
    const loadingToast = toast.loading(`Uploading ${docType.replace('_', ' ')}...`);
    try {
      const res = await verificationService.uploadDocument(file, docType);
      if (res.success) {
        toast.success(`${docType.replace('_', ' ')} uploaded successfully!`, { id: loadingToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: loadingToast });
    } finally {
      setUploadingDoc(null);
    }
  };

  // Trigger CGPE Aadhaar verification
  const handleVerifyAadhaar = async () => {
    if (!aadhaarInput || aadhaarInput.length !== 12 || isNaN(aadhaarInput)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setValidating('aadhaar');
    const loadToast = toast.loading('Verifying Aadhaar card via CGPE...');
    try {
      const res = await verificationService.verifyAadhaar(aadhaarInput);
      if (res.success) {
        toast.success(`Aadhaar verified: ${res.data.fullName}`, { id: loadToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Aadhaar verification failed', { id: loadToast });
    } finally {
      setValidating(null);
    }
  };

  // Trigger CGPE PAN verification
  const handleVerifyPan = async () => {
    if (!panInput.panNumber || panInput.panNumber.length !== 10) {
      toast.error('Please enter a valid 10-character PAN number');
      return;
    }
    if (!panInput.fullName) {
      toast.error('Please enter your full name as per PAN');
      return;
    }

    setValidating('pan');
    const loadToast = toast.loading('Verifying PAN details via CGPE...');
    try {
      const res = await verificationService.verifyPan(panInput.panNumber, panInput.fullName, panInput.dob || undefined);
      if (res.success) {
        toast.success(`PAN verified: ${res.data.fullName}`, { id: loadToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'PAN verification failed', { id: loadToast });
    } finally {
      setValidating(null);
    }
  };

  // Trigger CGPE Bank details verification
  const handleVerifyBank = async () => {
    if (!bankInput.accountNumber || !bankInput.ifsc || !bankInput.accountHolderName) {
      toast.error('Please fill in account number, IFSC, and account holder name');
      return;
    }

    setValidating('bank');
    const loadToast = toast.loading('Verifying Bank account details...');
    try {
      const res = await verificationService.verifyBankDetails(bankInput.accountNumber, bankInput.ifsc, bankInput.accountHolderName);
      if (res.success) {
        toast.success(`Bank details verified successfully!`, { id: loadToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bank verification failed', { id: loadToast });
    } finally {
      setValidating(null);
    }
  };

  // Trigger CGPE Selfie / Face matching
  const handleVerifySelfie = async () => {
    setValidating('selfie');
    const loadToast = toast.loading('Performing biometric face matching via CGPE...');
    try {
      const res = await verificationService.verifySelfieMatch();
      if (res.success) {
        toast.success(`Selfie matched! Score: ${res.data.matchScore}%`, { id: loadToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Selfie match failed', { id: loadToast });
    } finally {
      setValidating(null);
    }
  };

  // Final submit request
  const handleSubmitVerification = async () => {
    setLoading(true);
    const loadToast = toast.loading('Submitting verification request to admin...');
    try {
      const res = await verificationService.submitRequest();
      if (res.success) {
        toast.success(res.message || 'Verification submitted successfully!', { id: loadToast });
        await fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed', { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  // Document Icon Picker
  const getDocIcon = (docType) => {
    switch (docType) {
      case 'aadhaar':
      case 'pan':
        return <FiFileText className="text-primary-600 text-lg" />;
      case 'selfie':
        return <FiCamera className="text-primary-600 text-lg" />;
      case 'bank_details':
        return <FiLock className="text-primary-600 text-lg" />;
      default:
        return <FiBookOpen className="text-primary-600 text-lg" />;
    }
  };

  // Status Badge Picker
  const getDocStatusBadge = (statusObj) => {
    if (!statusObj.uploaded) {
      return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-bold">Not Uploaded</span>;
    }
    switch (statusObj.status) {
      case 'verified':
        return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle /> Verified</span>;
      case 'rejected':
        return <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><FiXCircle /> Rejected</span>;
      case 'under_review':
        return <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><FiClock /> Under Review</span>;
      default:
        return <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><FiClock /> Uploaded</span>;
    }
  };

  if (loading && !statusData) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if all required documents are uploaded
  const allRequiredUploaded = statusData?.requiredDocuments?.every(docType => {
    return statusData?.documents[docType]?.uploaded;
  });

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A]">
      <Header title="Identity Verification" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 py-6 max-w-md mx-auto space-y-6 pb-24">
        
        {/* Request Status Banner */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50">
          <h3 className="font-black text-base flex items-center gap-2">
            Verification Status
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Overall status: <span className="capitalize font-bold text-slate-700">{statusData?.overallStatus.replace('_', ' ')}</span>
          </p>
          
          {statusData?.overallStatus === 'verified' && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <FiCheckCircle className="text-lg text-emerald-600 flex-shrink-0" />
              <span>Identity verified successfully! You are fully eligible to receive bookings.</span>
            </div>
          )}

          {statusData?.overallStatus === 'pending_verification' && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <FiClock className="text-lg text-amber-600 flex-shrink-0" />
              <span>Submitted. Your request is under manual review by the administrator.</span>
            </div>
          )}

          {statusData?.overallStatus === 'rejected' && (
            <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <FiXCircle className="text-lg text-rose-600 flex-shrink-0" />
              <span>Verification rejected. Please review rejection reasons and re-upload.</span>
            </div>
          )}
        </div>

        {/* Dynamic Documents Slots */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">Required Checklist</h4>
          
          {statusData && Object.keys(statusData.documents).map(docType => {
            const doc = statusData.documents[docType];
            const isRequired = statusData.requiredDocuments.includes(docType);

            return (
              <div key={docType} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-4">
                
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
                      {getDocIcon(docType)}
                    </div>
                    <div>
                      <h5 className="font-bold capitalize text-sm">{docType.replace('_', ' ')}</h5>
                      <span className="text-[10px] text-slate-400 font-bold">{isRequired ? 'Mandatory Requirement' : 'Optional'}</span>
                    </div>
                  </div>
                  {getDocStatusBadge(doc)}
                </div>

                {/* Show rejection reason / re-upload instructions */}
                {doc.uploaded && doc.status === 'rejected' && doc.rejectionReason && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2">
                    <FiAlertTriangle className="text-rose-500 text-base shrink-0 mt-0.5" />
                    <p>{doc.rejectionReason}</p>
                  </div>
                )}

                {/* Secure File Uploader Input */}
                {(!doc.uploaded || doc.status === 'rejected') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        onClick={() => flutterBridge.isFlutter ? handleUpload(docType) : document.getElementById(`file-${docType}`).click()}
                        className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 py-5 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-all"
                      >
                        {uploadingDoc === docType ? (
                          <FiRefreshCw className="animate-spin text-primary-600 text-xl" />
                        ) : (
                          <>
                            <FiUploadCloud className="text-slate-400 text-xl mb-1.5" />
                            <span className="text-xs font-bold text-slate-500">Tap to upload file</span>
                          </>
                        )}
                        {!flutterBridge.isFlutter && (
                          <input 
                            type="file" 
                            id={`file-${docType}`} 
                            className="hidden" 
                            accept="image/*,application/pdf" 
                            onChange={(e) => handleUpload(docType, e)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instant Verification Forms (CGPE APIs integration) */}
                {doc.uploaded && doc.status !== 'verified' && (
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 space-y-3">
                    
                    {/* AADHAAR */}
                    {docType === 'aadhaar' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Instant CGPE Verification</p>
                        <input
                          type="text"
                          value={aadhaarInput}
                          onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                          maxLength={12}
                          placeholder="Enter 12-digit Aadhaar number"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <button
                          onClick={handleVerifyAadhaar}
                          disabled={validating === 'aadhaar'}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          {validating === 'aadhaar' ? <FiRefreshCw className="animate-spin" /> : null} Verify Aadhaar Card
                        </button>
                      </div>
                    )}

                    {/* PAN */}
                    {docType === 'pan' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Instant CGPE Verification</p>
                        <input
                          type="text"
                          value={panInput.panNumber}
                          onChange={(e) => setPanInput({ ...panInput, panNumber: e.target.value.toUpperCase() })}
                          maxLength={10}
                          placeholder="PAN Card Number"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 mb-2"
                        />
                        <input
                          type="text"
                          value={panInput.fullName}
                          onChange={(e) => setPanInput({ ...panInput, fullName: e.target.value })}
                          placeholder="Full Name (as per PAN)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <button
                          onClick={handleVerifyPan}
                          disabled={validating === 'pan'}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2"
                        >
                          {validating === 'pan' ? <FiRefreshCw className="animate-spin" /> : null} Verify PAN Card
                        </button>
                      </div>
                    )}

                    {/* BANK DETAILS */}
                    {docType === 'bank_details' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Instant CGPE Bank verification</p>
                        <input
                          type="text"
                          value={bankInput.accountNumber}
                          onChange={(e) => setBankInput({ ...bankInput, accountNumber: e.target.value })}
                          placeholder="Bank Account Number"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 mb-2"
                        />
                        <input
                          type="text"
                          value={bankInput.ifsc}
                          onChange={(e) => setBankInput({ ...bankInput, ifsc: e.target.value.toUpperCase() })}
                          placeholder="IFSC Code"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 mb-2"
                        />
                        <input
                          type="text"
                          value={bankInput.accountHolderName}
                          onChange={(e) => setBankInput({ ...bankInput, accountHolderName: e.target.value })}
                          placeholder="Account Holder Name"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <button
                          onClick={handleVerifyBank}
                          disabled={validating === 'bank'}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2"
                        >
                          {validating === 'bank' ? <FiRefreshCw className="animate-spin" /> : null} Verify Bank Account
                        </button>
                      </div>
                    )}

                    {/* SELFIE */}
                    {docType === 'selfie' && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Biometric Face Matching</p>
                        <p className="text-[11px] text-slate-400">Match your selfie facial biometric profile against Aadhaar or PAN photo.</p>
                        <button
                          onClick={handleVerifySelfie}
                          disabled={validating === 'selfie'}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          {validating === 'selfie' ? <FiRefreshCw className="animate-spin" /> : null} Verify Selfie Biometrics
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* Display Secure Details if Verified */}
                {doc.uploaded && doc.status === 'verified' && (
                  <div className="p-3 bg-slate-50 rounded-2xl flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500 font-semibold">
                      <span>Verification:</span>
                      <span className="text-emerald-600 font-bold">Successfully Verified</span>
                    </div>
                    {doc.documentNumberMasked && (
                      <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>Masked Doc Number:</span>
                        <span className="font-bold text-slate-700">{doc.documentNumberMasked}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Global Submission Action Button */}
        {statusData && statusData.overallStatus === 'not_submitted' && (
          <button
            onClick={handleSubmitVerification}
            disabled={!allRequiredUploaded}
            className="w-full bg-[#0F172A] hover:bg-[#000000] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            Submit for Final Review
          </button>
        )}

      </main>
    </div>
  );
};

export default Documents;
