import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUploadCloud, 
  FiTrash2, FiPlus, FiCheckCircle, FiInfo, FiCheck, FiFileText,
  FiUpload, FiChevronRight, FiBriefcase, FiMapPin, FiPhone, FiUser, FiShield
} from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import truckImg from '../../../../assets/b2b_warehouse_truck.png';

const LoginRegister = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login states
  const [loginEmailOrMobile, setLoginEmailOrMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Rejection handling states
  const [isRejectedMode, setIsRejectedMode] = useState(false);
  const [rejectedCompanyId, setRejectedCompanyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectedDocsList, setRejectedDocsList] = useState([]);

  // Multi-step Registration states
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Company Details
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [tanNumber, setTanNumber] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [companyAddress, setCompanyAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [sameAsCompanyAddress, setSameAsCompanyAddress] = useState(false);

  // Step 2: Authorized Person
  const [authName, setAuthName] = useState('');
  const [authDesignation, setAuthDesignation] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAltPhone, setAuthAltPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');

  // Step 3: Branches
  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchPincode, setBranchPincode] = useState('');
  const [branchContactPerson, setBranchContactPerson] = useState('');

  // Step 4: Documents Upload states
  const [documents, setDocuments] = useState({
    gstCertificate: { fileUrl: '', fileKey: '', fileName: '', uploading: false },
    panCard: { fileUrl: '', fileKey: '', fileName: '', uploading: false },
    companyRegistrationCertificate: { fileUrl: '', fileKey: '', fileName: '', uploading: false },
    cancelledCheque: { fileUrl: '', fileKey: '', fileName: '', uploading: false },
    addressProof: { fileUrl: '', fileKey: '', fileName: '', uploading: false }
  });

  const fileInputRefs = {
    logo: useRef(null),
    gstCertificate: useRef(null),
    panCard: useRef(null),
    companyRegistrationCertificate: useRef(null),
    cancelledCheque: useRef(null),
    addressProof: useRef(null),
    reuploadGstCertificate: useRef(null),
    reuploadPanCard: useRef(null),
    reuploadCompanyRegistrationCertificate: useRef(null),
    reuploadCancelledCheque: useRef(null),
    reuploadAddressProof: useRef(null)
  };

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Handle same address copy
  const handleAddressCheckbox = (checked) => {
    setSameAsCompanyAddress(checked);
    if (checked) {
      setBillingAddress(companyAddress);
    }
  };

  // Upload Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLogoUploading(true);
    try {
      const res = await api.post('/b2b/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setLogoUrl(res.data.fileUrl);
        toast.success('Company logo uploaded successfully');
      }
    } catch (err) {
      toast.error('Failed to upload logo');
      console.error(err);
    } finally {
      setLogoUploading(false);
    }
  };

  // Upload document helper
  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true }
    }));

    try {
      const res = await api.post('/b2b/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setDocuments(prev => ({
          ...prev,
          [docType]: { 
            fileUrl: res.data.fileUrl, 
            fileKey: res.data.fileKey, 
            fileName: file.name,
            uploading: false 
          }
        }));
        toast.success(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully`);
      }
    } catch (err) {
      toast.error('Failed to upload document');
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }));
      console.error(err);
    }
  };

  // Handle Branch Form Submit
  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!branchName || !branchAddress || !branchCity || !branchState || !branchPincode || !branchContactPerson) {
      toast.error('Please fill all branch details');
      return;
    }
    const newBranch = {
      branchName,
      branchAddress,
      city: branchCity,
      state: branchState,
      pincode: branchPincode,
      contactPerson: branchContactPerson
    };
    setBranches([...branches, newBranch]);
    // reset form
    setBranchName('');
    setBranchAddress('');
    setBranchCity('');
    setBranchState('');
    setBranchPincode('');
    setBranchContactPerson('');
    setShowBranchForm(false);
    toast.success('Branch added successfully');
  };

  const handleRemoveBranch = (index) => {
    setBranches(branches.filter((_, i) => i !== index));
    toast.success('Branch removed');
  };

  // Progress logic
  const getProgressPercentage = () => {
    return currentStep * 20;
  };

  // Step Navigations
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!companyName || !gstNumber || !panNumber || !tanNumber || !companyAddress || !billingAddress) {
        toast.error('Please fill all required company details');
        return;
      }
      if (!logoUrl) {
        toast.error('Please upload company logo');
        return;
      }
    } else if (currentStep === 2) {
      if (!authName || !authDesignation || !authEmail || !authPhone || !authPassword || !authConfirmPassword) {
        toast.error('Please fill all required authorized person fields');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (authPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
    } else if (currentStep === 4) {
      // Check if all files uploaded
      const missingDocs = Object.keys(documents).filter(key => !documents[key].fileUrl);
      if (missingDocs.length > 0) {
        toast.error('Please upload all required documents');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // B2B Submit Registration
  const handleSubmitRegistration = async () => {
    setLoading(true);
    const docsPayload = Object.keys(documents).map(key => ({
      documentType: key,
      fileUrl: documents[key].fileUrl,
      fileKey: documents[key].fileKey
    }));

    const payload = {
      companyName,
      gstNumber,
      panNumber,
      tanNumber,
      cinNumber,
      logoUrl,
      companyAddress,
      billingAddress,
      branches,
      authorizedPerson: {
        name: authName,
        designation: authDesignation,
        email: authEmail,
        phone: authPhone,
        altPhone: authAltPhone
      },
      email: authEmail,
      phone: authPhone,
      password: authPassword,
      documents: docsPayload
    };

    try {
      const res = await api.post('/b2b/register', payload);
      if (res.data.success) {
        toast.success('Registration request submitted successfully!');
        setCurrentStep(5); // Review and submitted state
        // Clear forms
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit registration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // B2B Login Action
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmailOrMobile || !loginPassword) {
      toast.error('Please enter both Email/Mobile and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/b2b/login', {
        emailOrMobile: loginEmailOrMobile,
        password: loginPassword
      });

      if (res.data.success) {
        const { accessToken, refreshToken, company } = res.data;
        
        // Save to session and local storage
        if (rememberMe) {
          localStorage.setItem('b2bAccessToken', accessToken);
          localStorage.setItem('b2bRefreshToken', refreshToken);
          localStorage.setItem('b2bData', JSON.stringify(company));
        } else {
          sessionStorage.setItem('b2bAccessToken', accessToken);
          sessionStorage.setItem('b2bRefreshToken', refreshToken);
          sessionStorage.setItem('b2bData', JSON.stringify(company));
        }

        toast.success('Welcome back!');
        navigate('/b2b/dashboard');
      }
    } catch (err) {
      console.error('Login error details:', err.response);
      const errStatus = err.response?.status;
      const errData = err.response?.data;

      if (errStatus === 403 && errData?.verificationStatus === 'pending') {
        toast.error('Your registration request is pending admin approval.');
      } else if (errStatus === 403 && errData?.verificationStatus === 'rejected') {
        toast.error('Your registration request has been rejected by the admin.');
        // Activate Rejection Document re-upload view
        setIsRejectedMode(true);
        setRejectedCompanyId(errData.company?.id);
        setRejectionReason(errData.rejectionReason);
        
        // Map current docs to re-upload lists
        const mappedDocs = (errData.company?.documents || []).map(doc => ({
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          fileKey: doc.fileKey || '',
          status: doc.status || 'uploaded',
          rejectionReason: doc.rejectionReason || ''
        }));
        setRejectedDocsList(mappedDocs);
      } else {
        toast.error(errData?.message || 'Invalid Email/Mobile or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reupload handling for rejected files
  const handleReuploadDoc = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    // Show temporary upload state
    setRejectedDocsList(prev => prev.map(doc => 
      doc.documentType === docType ? { ...doc, status: 'uploading' } : doc
    ));

    try {
      const res = await api.post('/b2b/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setRejectedDocsList(prev => prev.map(doc => 
          doc.documentType === docType 
            ? { ...doc, fileUrl: res.data.fileUrl, fileKey: res.data.fileKey, status: 'uploaded', rejectionReason: '' } 
            : doc
        ));
        toast.success('Document updated successfully');
      }
    } catch (err) {
      toast.error('Upload failed');
      setRejectedDocsList(prev => prev.map(doc => 
        doc.documentType === docType ? { ...doc, status: 'rejected' } : doc
      ));
    }
  };

  // Resubmit re-uploaded docs for admin approval
  const handleResubmitApplication = async () => {
    setLoading(true);
    try {
      const payload = {
        companyId: rejectedCompanyId,
        documents: rejectedDocsList.map(doc => ({
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          fileKey: doc.fileKey
        }))
      };
      
      const res = await api.post('/b2b/reupload-documents', payload);
      if (res.data.success) {
        toast.success('Application resubmitted successfully for review.');
        setIsRejectedMode(false);
        setLoginEmailOrMobile('');
        setLoginPassword('');
      }
    } catch (err) {
      toast.error('Failed to resubmit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Welcome Back & Login / Illustration */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E6F4F2] shadow-xl shadow-teal-500/5 p-6 flex flex-col justify-between min-h-[750px] relative overflow-hidden">
          
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <Logo className="h-9 w-auto" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 tracking-wide">WBI</span>
                <span className="text-[10px] text-gray-500 font-bold -mt-1">B2B Service Platform</span>
              </div>
            </div>

            {/* Switch between rejected re-upload and standard login */}
            {isRejectedMode ? (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Onboarding Rejected</h2>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  Please correct and re-upload the rejected documents to submit your company profile for review.
                </p>

                {/* Reason Alert Banner */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mt-4 text-red-700 text-xs font-semibold flex gap-2.5 items-start">
                  <FiInfo className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">Admin Rejection Reason:</span>
                    <p className="font-medium mt-0.5">{rejectionReason}</p>
                  </div>
                </div>

                {/* Rejected Documents List */}
                <div className="mt-5 space-y-3">
                  {rejectedDocsList.map((doc) => {
                    const docCleanName = doc.documentType.replace(/([A-Z])/g, ' $1');
                    const isDocRejected = doc.status === 'rejected';

                    return (
                      <div key={doc.documentType} className={`border rounded-xl p-3 flex justify-between items-center gap-3 transition-colors ${
                        isDocRejected ? 'border-red-200 bg-red-50/10' : 'border-[#E6F4F2] bg-white'
                      }`}>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-800 capitalize truncate">{docCleanName}</p>
                          <span className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${
                            isDocRejected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {doc.status}
                          </span>
                          {isDocRejected && doc.rejectionReason && (
                            <p className="text-[10px] text-red-600 mt-1 leading-snug font-medium italic">
                              Reason: {doc.rejectionReason}
                            </p>
                          )}
                        </div>

                        <div>
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRefs[`reupload${doc.documentType.charAt(0).toUpperCase()}${doc.documentType.slice(1)}`]}
                            onChange={(e) => handleReuploadDoc(e, doc.documentType)}
                          />
                          <button 
                            type="button"
                            onClick={() => fileInputRefs[`reupload${doc.documentType.charAt(0).toUpperCase()}${doc.documentType.slice(1)}`].current.click()}
                            className={`text-xs px-3 py-1.5 font-semibold rounded-lg shrink-0 border transition-all ${
                              isDocRejected 
                                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700 shadow-sm' 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {doc.status === 'uploading' ? 'Uploading...' : 'Re-upload'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={handleResubmitApplication}
                  disabled={loading || rejectedDocsList.some(d => d.status === 'uploading')}
                  className="w-full bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-300 text-white text-sm font-bold h-11 rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 mt-5 transition-all"
                >
                  {loading ? 'Submitting...' : 'Resubmit Application'}
                  <FiArrowRight />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRejectedMode(false)}
                  className="w-full text-center text-xs font-semibold text-gray-500 hover:text-[#10AFA5] mt-4 block"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              // Standard Login
              <div className="animate-fade-in">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Welcome Back!</h2>
                <p className="text-gray-500 text-sm mt-1">Login to access your B2B dashboard</p>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Email Address or Mobile</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        required
                        value={loginEmailOrMobile}
                        onChange={(e) => setLoginEmailOrMobile(e.target.value)}
                        placeholder="Enter email or mobile" 
                        className="w-full h-11 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-700">Password</label>
                      <a href="#" className="text-xs font-bold text-[#10AFA5] hover:underline">Forgot Password?</a>
                    </div>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password" 
                        className="w-full h-11 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-10 pr-10 focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5] transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#10AFA5] border-gray-300 rounded focus:ring-[#10AFA5] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-600">Remember Me</span>
                  </label>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-300 text-white text-sm font-bold h-11 rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 mt-6 transition-all"
                  >
                    {loading ? 'Verifying...' : 'Login'}
                    <FiArrowRight />
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">or continue with</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  {/* SSO Sign Ins */}
                  <button 
                    type="button"
                    onClick={() => toast.success('Google corporate integration coming soon')}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold h-11 rounded-xl flex items-center justify-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button 
                    type="button"
                    onClick={() => toast.success('Microsoft Active Directory coming soon')}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold h-11 rounded-xl flex items-center justify-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#F25022" d="M0 0h11v11H0z"/>
                      <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                      <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                      <path fill="#FFB900" d="M12 12h11v11H12z"/>
                    </svg>
                    Continue with Microsoft
                  </button>

                  {/* Sign Up Redirect */}
                  <p className="text-center text-xs font-semibold text-gray-500 mt-5">
                    Don't have a company account?{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-[#10AFA5] font-black hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Illustration & Marketing Seal */}
          <div className="mt-8 relative shrink-0">
            <img 
              src={truckImg} 
              alt="WBI Warehouse logistics" 
              className="w-full h-auto object-contain rounded-2xl border border-[#F0FDFA]" 
            />
          </div>

        </div>

        {/* Right Card: Multi-step Registration Wizard */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E6F4F2] shadow-xl shadow-teal-500/5 p-6 lg:p-8 min-h-[750px] flex flex-col justify-between">
          {activeTab === 'login' && !isRejectedMode ? (
            // Landing state if activeTab is login: provide quick register wizard introduction
            <div className="flex flex-col justify-center items-center h-full text-center py-20 animate-fade-in">
              <div className="h-16 w-16 bg-[#F0FDFA] text-[#10AFA5] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <FiBriefcase className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Need a Partner Account?</h2>
              <p className="text-gray-500 text-sm max-w-md mt-2 leading-relaxed">
                Unlock instant booking of skilled industrial teams, logistics matching, and bulk job execution features with a single verified partner panel.
              </p>
              
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="mt-8 bg-[#10AFA5] hover:bg-[#0D9488] text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg shadow-teal-500/10 flex items-center gap-2 transition-all hover:scale-102"
              >
                Start Onboarding
                <FiArrowRight />
              </button>
            </div>
          ) : (
            // Active Registration Wizard
            <div className="flex flex-col justify-between h-full flex-grow animate-fade-in">
              
              {/* Onboarding Wizard Header */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0FDFA] pb-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Your B2B Account</h2>
                    <p className="text-gray-500 text-xs mt-0.5 font-medium">Register your company to start managing bulk jobs & services</p>
                  </div>
                  
                  {/* Step status badge */}
                  <div className="bg-[#F0FDFA] text-[#10AFA5] text-[10px] font-bold px-3 py-1.5 rounded-full self-start md:self-auto border border-[#E6F4F2]">
                    Progress: Step {currentStep} of 5 ({getProgressPercentage()}%)
                  </div>
                </div>

                {/* Progress bar steps graphic */}
                <div className="mb-8 overflow-x-auto no-scrollbar py-2">
                  <div className="flex items-center justify-between min-w-[600px] px-2">
                    {[
                      { num: 1, label: 'Company Details' },
                      { num: 2, label: 'Authorized Person' },
                      { num: 3, label: 'Address & Branches' },
                      { num: 4, label: 'Documents' },
                      { num: 5, label: 'Review & Submit' }
                    ].map((step) => {
                      const isCompleted = currentStep > step.num;
                      const isCurrent = currentStep === step.num;

                      return (
                        <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted 
                                ? 'bg-[#10AFA5] border-[#10AFA5] text-white shadow-sm' 
                                : isCurrent 
                                  ? 'bg-white border-[#10AFA5] text-[#10AFA5] font-black ring-4 ring-[#10AFA5]/10' 
                                  : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              {isCompleted ? <FiCheck className="w-4 h-4" /> : step.num}
                            </div>
                            <span className={`text-[10px] font-bold absolute top-9 whitespace-nowrap ${
                              isCurrent ? 'text-[#10AFA5]' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          
                          {/* Join line */}
                          {step.num < 5 && (
                            <div className="flex-1 h-0.5 mx-2 bg-gray-100 relative">
                              <div className={`absolute inset-0 bg-[#10AFA5] transition-all duration-300 ${
                                isCompleted ? 'w-full' : 'w-0'
                              }`}></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step Forms */}
                <div className="mt-6">
                  
                  {/* Step 1: Company Information & Addresses */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Company Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Company Name *</label>
                          <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter company name"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">GST Number *</label>
                          <input 
                            type="text" 
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                            placeholder="Enter GST number"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">PAN Number *</label>
                          <input 
                            type="text" 
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            placeholder="Enter PAN number"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">TAN Number *</label>
                          <input 
                            type="text" 
                            value={tanNumber}
                            onChange={(e) => setTanNumber(e.target.value.toUpperCase())}
                            placeholder="Enter TAN number"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">CIN Number (Optional)</label>
                          <input 
                            type="text" 
                            value={cinNumber}
                            onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                            placeholder="Enter CIN number"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        {/* Logo Upload Box */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Company Logo *</label>
                          <input 
                            type="file" 
                            ref={fileInputRefs.logo}
                            className="hidden" 
                            onChange={handleLogoUpload}
                            accept="image/*"
                          />
                          <div 
                            onClick={() => fileInputRefs.logo.current.click()}
                            className="border-2 border-dashed border-gray-200 hover:border-[#10AFA5] cursor-pointer rounded-xl h-24 flex flex-col items-center justify-center gap-1.5 transition-colors p-2 bg-gray-50 overflow-hidden"
                          >
                            {logoUploading ? (
                              <span className="text-xs text-gray-500 font-bold">Uploading...</span>
                            ) : logoUrl ? (
                              <img src={logoUrl} alt="Logo preview" className="h-full w-auto object-contain rounded-lg" />
                            ) : (
                              <>
                                <FiUploadCloud className="w-5 h-5 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500">Upload Logo (PNG, JPG up to 2MB)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Addresses */}
                      <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide mt-8">Addresses</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Company Address *</label>
                          <div className="relative">
                            <FiMapPin className="absolute left-3.5 top-3 text-gray-400" />
                            <textarea 
                              value={companyAddress}
                              onChange={(e) => {
                                setCompanyAddress(e.target.value);
                                if (sameAsCompanyAddress) setBillingAddress(e.target.value);
                              }}
                              placeholder="Enter company headquarters address"
                              className="w-full h-20 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all resize-none"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-700">Billing Address *</label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={sameAsCompanyAddress}
                                onChange={(e) => handleAddressCheckbox(e.target.checked)}
                                className="w-3.5 h-3.5 text-[#10AFA5] border-gray-300 rounded focus:ring-[#10AFA5]" 
                              />
                              <span className="text-[10px] font-bold text-gray-500">Same as company address</span>
                            </label>
                          </div>
                          <div className="relative">
                            <FiMapPin className="absolute left-3.5 top-3 text-gray-400" />
                            <textarea 
                              disabled={sameAsCompanyAddress}
                              value={billingAddress}
                              onChange={(e) => setBillingAddress(e.target.value)}
                              placeholder="Enter invoice billing address"
                              className="w-full h-20 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Step 2: Authorized Person Contact & Account Password */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Authorized Person Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                          <div className="relative">
                            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="Enter full name"
                              className="w-full h-10 border border-gray-200 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Designation *</label>
                          <div className="relative">
                            <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              value={authDesignation}
                              onChange={(e) => setAuthDesignation(e.target.value)}
                              placeholder="e.g. Operations Manager"
                              className="w-full h-10 border border-gray-200 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Corporate Email Address *</label>
                          <div className="relative">
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="email" 
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="name@company.com"
                              className="w-full h-10 border border-gray-200 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number *</label>
                          <div className="relative">
                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="tel" 
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              placeholder="10-digit mobile number"
                              className="w-full h-10 border border-gray-200 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Alternate Contact Number (Optional)</label>
                          <div className="relative">
                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="tel" 
                              value={authAltPhone}
                              onChange={(e) => setAuthAltPhone(e.target.value)}
                              placeholder="Alternate number"
                              className="w-full h-10 border border-gray-200 text-sm rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide mt-8">Account Password</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
                          <input 
                            type="password" 
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Create password"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Confirm Password *</label>
                          <input 
                            type="password" 
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full h-10 border border-gray-200 text-sm rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Step 3: Address & Branches */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Branches & Warehouses</h3>
                        <button
                          type="button"
                          onClick={() => setShowBranchForm(!showBranchForm)}
                          className="bg-[#10AFA5]/10 hover:bg-[#10AFA5]/20 text-[#10AFA5] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Branch
                        </button>
                      </div>

                      {/* Add Branch Inline Form */}
                      {showBranchForm && (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-4 animate-fade-in">
                          <h4 className="text-xs font-bold text-gray-800">Branch Details</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Branch/Warehouse Name *</label>
                              <input 
                                type="text"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                placeholder="e.g. Pune Central Depot"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Contact Person Name *</label>
                              <input 
                                type="text"
                                value={branchContactPerson}
                                onChange={(e) => setBranchContactPerson(e.target.value)}
                                placeholder="Branch Head Name"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Address *</label>
                              <input 
                                type="text"
                                value={branchAddress}
                                onChange={(e) => setBranchAddress(e.target.value)}
                                placeholder="Full street address"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">City *</label>
                              <input 
                                type="text"
                                value={branchCity}
                                onChange={(e) => setBranchCity(e.target.value)}
                                placeholder="City"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">State *</label>
                              <input 
                                type="text"
                                value={branchState}
                                onChange={(e) => setBranchState(e.target.value)}
                                placeholder="State"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Pincode *</label>
                              <input 
                                type="text"
                                value={branchPincode}
                                onChange={(e) => setBranchPincode(e.target.value)}
                                placeholder="Pincode"
                                className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] bg-white transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button 
                              type="button" 
                              onClick={() => setShowBranchForm(false)}
                              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              type="button" 
                              onClick={handleAddBranch}
                              className="px-3 py-1.5 bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              Save Branch
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Branches List */}
                      {branches.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400 text-xs font-bold flex flex-col items-center gap-2">
                          <FiMapPin className="w-6 h-6" />
                          No branches added yet. You can add multiple office locations if needed.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {branches.map((b, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm flex justify-between gap-3 relative hover:border-[#10AFA5]/30 transition-colors">
                              <div>
                                <p className="text-sm font-bold text-gray-800 capitalize">{b.branchName}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-snug">{b.branchAddress}, {b.city}, {b.state} - {b.pincode}</p>
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                  <FiUser className="w-3.5 h-3.5 text-[#10AFA5]" />
                                  Contact: {b.contactPerson}
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveBranch(index)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg self-start transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Step 4: Documents Upload wizard */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      
                      <div className="bg-[#F0FDFA] border border-[#10AFA5]/10 rounded-2xl p-4 text-[#10AFA5] text-xs font-semibold flex gap-3 items-center">
                        <FiShield className="w-6 h-6 shrink-0" />
                        <p>Upload clear digital scans/photos of your corporate documentation. PDF, PNG, and JPG formats are accepted up to 5MB.</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { key: 'gstCertificate', label: 'GST Certificate *', type: 'gstCertificate' },
                          { key: 'panCard', label: 'Company PAN Card *', type: 'panCard' },
                          { key: 'companyRegistrationCertificate', label: 'Incorporation / Company Registration Certificate *', type: 'companyRegistrationCertificate' },
                          { key: 'cancelledCheque', label: 'Cancelled Cheque *', type: 'cancelledCheque' },
                          { key: 'addressProof', label: 'Registered Address Proof *', type: 'addressProof' }
                        ].map((docItem) => {
                          const stateVal = documents[docItem.key];
                          return (
                            <div key={docItem.key} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  stateVal.fileUrl ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}>
                                  <FiFileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{docItem.label}</p>
                                  {stateVal.fileUrl ? (
                                    <span className="text-[10px] font-bold text-green-600 truncate max-w-[200px] block mt-0.5">
                                      {stateVal.fileName || 'Uploaded'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Not uploaded</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  ref={fileInputRefs[docItem.key]}
                                  onChange={(e) => handleDocumentUpload(e, docItem.key)}
                                />
                                <button 
                                  type="button"
                                  onClick={() => fileInputRefs[docItem.key].current.click()}
                                  className={`text-xs px-4 py-2 font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                                    stateVal.fileUrl 
                                      ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                                      : 'bg-white border-gray-200 text-[#10AFA5] hover:bg-[#F0FDFA] hover:border-[#10AFA5]/30'
                                  }`}
                                >
                                  {stateVal.uploading ? (
                                    'Uploading...'
                                  ) : stateVal.fileUrl ? (
                                    <>
                                      <FiCheck /> Change File
                                    </>
                                  ) : (
                                    <>
                                      <FiUpload /> Upload File
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                  {/* Step 5: Review & Submit or Final Submitted Screen */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10AFA5]"></div>
                          <p className="text-gray-500 text-sm font-bold">Submitting your registration request...</p>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-fade-in">
                          
                          {/* Success Summary Header */}
                          <div className="text-center py-6 border-b border-gray-100 flex flex-col items-center">
                            <FiCheckCircle className="w-14 h-14 text-green-500 mb-3" />
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Application Preview</h3>
                            <p className="text-gray-500 text-xs mt-1 font-medium">Please review the details below before submitting for approval.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 font-semibold leading-relaxed">
                            
                            {/* Company Summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                              <h4 className="text-sm font-black text-gray-800 border-l-3 border-[#10AFA5] pl-1.5 mb-3 uppercase tracking-wider">Company Profile</h4>
                              <p><span className="text-gray-400 font-medium">Name:</span> {companyName}</p>
                              <p><span className="text-gray-400 font-medium">GSTIN:</span> {gstNumber}</p>
                              <p><span className="text-gray-400 font-medium">PAN:</span> {panNumber}</p>
                              <p><span className="text-gray-400 font-medium">TAN:</span> {tanNumber}</p>
                              {cinNumber && <p><span className="text-gray-400 font-medium">CIN:</span> {cinNumber}</p>}
                              <p><span className="text-gray-400 font-medium">Address:</span> {companyAddress}</p>
                            </div>

                            {/* Contact Person Summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                              <h4 className="text-sm font-black text-gray-800 border-l-3 border-[#10AFA5] pl-1.5 mb-3 uppercase tracking-wider">Authorized Person</h4>
                              <p><span className="text-gray-400 font-medium">Name:</span> {authName}</p>
                              <p><span className="text-gray-400 font-medium">Designation:</span> {authDesignation}</p>
                              <p><span className="text-gray-400 font-medium">Email:</span> {authEmail}</p>
                              <p><span className="text-gray-400 font-medium">Phone:</span> {authPhone}</p>
                              {authAltPhone && <p><span className="text-gray-400 font-medium">Alt:</span> {authAltPhone}</p>}
                            </div>

                            {/* Documents list summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 md:col-span-2">
                              <h4 className="text-sm font-black text-gray-800 border-l-3 border-[#10AFA5] pl-1.5 mb-3 uppercase tracking-wider">Uploaded Documents</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.keys(documents).map(k => (
                                  <div key={k} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100">
                                    <FiCheck className="text-green-500 w-4 h-4 shrink-0" />
                                    <span className="font-bold text-[10px] text-gray-700 capitalize truncate">
                                      {k.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>

              {/* Wizard Footer Controls */}
              {currentStep < 5 && (
                <div className="border-t border-[#F0FDFA] pt-6 flex justify-between items-center gap-4 mt-8 shrink-0">
                  <button
                    type="button"
                    disabled={currentStep === 1}
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/10 flex items-center gap-1.5 transition-colors"
                  >
                    Next Step
                    <FiChevronRight />
                  </button>
                </div>
              )}

              {currentStep === 5 && !loading && (
                <div className="border-t border-[#F0FDFA] pt-6 flex justify-between items-center gap-4 mt-8 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitRegistration}
                    className="bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-teal-500/10 flex items-center gap-1.5 transition-colors"
                  >
                    Submit for Approval
                    <FiCheckCircle />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginRegister;
